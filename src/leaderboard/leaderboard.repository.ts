import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderboardDelta } from '../common/entity/leaderboard-delta.entity';
import type { RedisClient } from './leaderboard.module';
import { LeaderboardKeys } from './leaderboard-keys';
import { PlayerScoreDto } from '../common/dto/PlayerScore.dto';
import { PlayerPositionDto } from '../common/dto/PlayerPosition.dto';

const NEW_PLAYER_INITIAL_SCORE = 1000;

@Injectable()
export class LeaderboardRepository {
  private readonly logger = new Logger(LeaderboardRepository.name);

  constructor(
    @InjectRepository(LeaderboardDelta)
    private readonly deltas: Repository<LeaderboardDelta>,

    @Inject('REDIS_CLIENT')
    private readonly redis: RedisClient,

    private readonly leaderboardKeys: LeaderboardKeys,
  ) {}

  async initializePlayer(userId: number, newScore: number): Promise<void> {
    this.logger.debug(`Initializing player ${userId} with score ${newScore}`);
    const delta = NEW_PLAYER_INITIAL_SCORE ?? newScore;

    await this.deltas.insert({ userId, delta, createdAt: new Date() });

    const dailyKey = this.leaderboardKeys.getTodayKey();
    const weeklyKey = this.leaderboardKeys.getThisWeekKey();
    const allTimeKey = this.leaderboardKeys.getAllTime();

    await this.redis
      .multi()
      .zadd(dailyKey, delta, userId)
      //.expire(dailyKey, this.leaderboardKeys.getTodayExpire())
      .zadd(weeklyKey, delta, userId)
      //.expire(weeklyKey, this.leaderboardKeys.getThisWeekExpire())
      .zadd(allTimeKey, delta, userId)
      .exec();
  }

  async updateScore(userId: number, scoreDelta: number): Promise<void> {
    this.logger.debug(`Updating player ${userId} with delta ${scoreDelta}`);
    await this.deltas.save({ userId, delta: scoreDelta });

    const dailyKey = this.leaderboardKeys.getTodayKey();
    const weeklyKey = this.leaderboardKeys.getThisWeekKey();
    const allTimeKey = this.leaderboardKeys.getAllTime();

    await this.redis
      .multi()
      .zincrby(dailyKey, scoreDelta, userId)
      //.expire(dailyKey, this.leaderboardKeys.getTodayExpire())
      .zincrby(weeklyKey, scoreDelta, userId)
      //.expire(weeklyKey, this.leaderboardKeys.getThisWeekExpire())
      .zincrby(allTimeKey, scoreDelta, userId)
      .exec();
  }

  async getAllTimeLeaderboard(
    limit: number,
    offset: number,
  ): Promise<PlayerScoreDto[]> {
    const allTimeKey = this.leaderboardKeys.getAllTime();
    const playerScores: PlayerScoreDto[] = [];

    try {
      const redisResult = await this.redis.zrevrange(
        allTimeKey,
        offset,
        offset + limit - 1,
        'WITHSCORES',
      );

      return redisResult.reduce((acc, curr, index) => {
        if (index % 2 === 0) {
          acc.push(PlayerScoreDto.of(curr, redisResult[index + 1]));
        }
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
    const allTimeKey = this.leaderboardKeys.getAllTime();

    try {
      const playerPosition = await this.redis.zrevrank(allTimeKey, userId);
      if (!playerPosition) return PlayerPositionDto.empty();

      const start = Math.max(playerPosition - contextSize, 0);
      const end = playerPosition + contextSize;

      const contextResults = await this.redis.zrevrange(
        allTimeKey,
        start,
        end,
        'WITHSCORES',
      );

      const scores: PlayerScoreDto[] = [];
      for (let i = 0; i < contextResults.length; i += 2) {
        scores.push(
          PlayerScoreDto.of(contextResults[i], contextResults[i + 1]),
        );
      }

      const playerIndex = scores.findIndex(
        (p) => p.getUserId() === Number(userId),
      );

      const playerScore = scores[playerIndex].getScore();
      const before = scores.slice(0, playerIndex);
      const after = scores.slice(playerIndex + 1);

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
}
