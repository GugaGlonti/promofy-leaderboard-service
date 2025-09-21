import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderboardDelta } from '../common/entity/leaderboard-delta.entity';
import type { RedisClient } from './leaderboard.module';
import { LeaderboardKeys } from './leaderboard-keys';

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
}
