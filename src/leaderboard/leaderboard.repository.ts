import { Leaderboard } from './../common/entity/leaderboard.entity';
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

    @InjectRepository(Leaderboard)
    private readonly leaderboard: Repository<Leaderboard>,

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

  async getLeaderboardFromPostgres(
    id: string,
    limit: number,
    page: number,
    pageSize: number,
  ): Promise<PlayerScoreDto[]> {
    const offset = (page - 1) * pageSize;
    if (limit > 0 && offset >= limit) return [];

    const remaining = limit > 0 ? limit - offset : undefined;
    const take = limit > 0 ? Math.min(pageSize, remaining as number) : pageSize;

    return this.leaderboard
      .createQueryBuilder('leaderboard')
      .innerJoin('leaderboard.deltas', 'delta')
      .select('delta.playerId', 'playerId')
      .addSelect('SUM(delta.scoreDelta)', 'totalScore')
      .where('leaderboard.id = :id', { id })
      .groupBy('delta.playerId')
      .orderBy('"totalScore"', 'DESC')
      .skip(offset)
      .take(take)
      .getRawMany<PlayerScoreDto>();
  }

  async getLeaderboard(
    id: string,
    limit: number,
    page: number,
    pageSize: number,
  ): Promise<PlayerScoreDto[]> {
    return this.getLeaderboardFromPostgres(id, limit, page, pageSize);
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
