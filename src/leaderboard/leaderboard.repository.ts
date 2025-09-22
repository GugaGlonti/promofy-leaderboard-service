import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerPositionDto } from '../common/dto/PlayerPosition.dto';
import { PlayerScoreDto } from '../common/dto/PlayerScore.dto';
import { LeaderboardDelta } from '../common/entity/leaderboard-delta.entity';
import { LeaderboardCache } from './leaderboard-cache';
import type { RedisClient } from './leaderboard.module';

@Injectable()
export class LeaderboardRepository {
  private readonly logger = new Logger(LeaderboardRepository.name);

  constructor(
    @InjectRepository(LeaderboardDelta)
    private readonly deltas: Repository<LeaderboardDelta>,

    @Inject('REDIS_CLIENT')
    private readonly redis: RedisClient,

    private readonly leaderboardCache: LeaderboardCache,
  ) {}

  async initializePlayer(userId: number, newScore: number): Promise<void> {
    this.logger.debug(`Initializing player ${userId} with score ${newScore}`);
    await this.addToDatabase(userId, newScore);
    await this.addToRedis(userId, newScore);
  }

  async updateScore(userId: number, scoreDelta: number): Promise<void> {
    this.logger.debug(`Updating player ${userId} with delta ${scoreDelta}`);
    await this.addToDatabase(userId, scoreDelta);
    await this.addToRedis(userId, scoreDelta);
  }

  async getAllTimeLeaderboard(
    limit: number,
    offset: number,
  ): Promise<PlayerScoreDto[]> {
    const allTimeKey = this.leaderboardCache.getAllTime();
    const playerScores: PlayerScoreDto[] = [];

    try {
      const redisResult = await this.redis.zrevrange(
        allTimeKey,
        offset,
        offset + limit - 1,
        'WITHSCORES',
      );

      return redisResult.reduce((acc, curr, index) => {
        if (index % 2 === 0)
          acc.push(PlayerScoreDto.of(curr, redisResult[index + 1]));
        return acc;
      }, playerScores);
    } catch (error) {
      this.logger.error(`Error fetching leaderboard from Redis`, error);
    }

    try {
      return this.deltas
        .createQueryBuilder('delta')
        .select('delta.userId', 'userId')
        .addSelect('SUM(delta.delta)', 'totalScore')
        .groupBy('delta.userId')
        .orderBy('totalScore', 'DESC')
        .limit(limit)
        .offset(offset)
        .getRawMany<PlayerScoreDto>();
    } catch (error) {
      this.logger.warn(`Failed to fetch from DB:`, error);
    }

    return [];
  }

  async getPlayerPosition(
    userId: string,
    contextSize: number,
  ): Promise<PlayerPositionDto> {
    const allTimeKey = this.leaderboardCache.getAllTime();

    try {
      const playerPosition = await this.redis.zrevrank(allTimeKey, userId);
      if (!playerPosition) return PlayerPositionDto.empty();

      const start = Math.max(playerPosition - contextSize, 0);
      const end = playerPosition + contextSize;

      const context = await this.redis.zrevrange(
        allTimeKey,
        start,
        end,
        'WITHSCORES',
      );

      const scores: PlayerScoreDto[] = [];
      for (let i = 0; i < context.length; i += 2)
        scores.push(PlayerScoreDto.of(context[i], context[i + 1]));

      const player = scores.findIndex((p) => p.getUserId() === Number(userId));
      const playerScore = scores[player].getScore();
      const before = scores.slice(0, player);
      const after = scores.slice(player + 1);

      return new PlayerPositionDto(
        playerPosition + 1,
        playerScore,
        contextSize,
        before,
        after,
      );
    } catch (error) {
      this.logger.error(`Error fetching player position from Redis:`, error);
      return PlayerPositionDto.empty();
    }
  }

  private async addToDatabase(playerId: number, scoreDelta: number) {
    return this.deltas.save({
      playerId,
      scoreDelta,
      createdAt: new Date(),
      leaderboards: [
        this.leaderboardCache.getTodayLeaderboard(),
        this.leaderboardCache.getThisWeekLeaderboard(),
        this.leaderboardCache.getAllTimeLeaderboard(),
      ],
    });
  }

  private async addToRedis(
    playerId: number,
    scoreDelta: number,
  ): Promise<void> {
    await this.redis
      .multi()
      .zincrby(this.leaderboardCache.getTodayKey(), scoreDelta, playerId) //.expire(dailyKey, this.leaderboardKeys.getTodayExpire())
      .zincrby(this.leaderboardCache.getThisWeekKey(), scoreDelta, playerId) //.expire(weeklyKey, this.leaderboardKeys.getThisWeekExpire())
      .zincrby(this.leaderboardCache.getAllTime(), scoreDelta, playerId)
      .exec();
  }
}
