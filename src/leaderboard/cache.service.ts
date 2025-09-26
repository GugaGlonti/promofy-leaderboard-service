import { LeaderboardSyncService } from './leaderboard-sync.service';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { LeaderboardEntry } from './dto/leaderboard-entry.dto';
import type { RedisClient } from './leaderboard.module';
import { CacheException } from './exception/Cache.exception';

export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: RedisClient,

    private readonly leaderboardSyncService: LeaderboardSyncService,
  ) {}

  async onModuleInit() {
    this.logger.debug('CacheService initialized');
    this.bindCallbacks();
    await this.syncLeaderboardIDs();
  }

  private bindCallbacks() {
    this.redis.on('connect', () => this.logger.log('Redis client connected'));
    this.redis.on('ready', () => this.logger.log('Redis client ready'));
    this.redis.on('error', (err) => this.logger.error(`Redis error: ${err}`));
    this.redis.on('end', () => this.logger.log('Redis connection closed'));
    this.redis.on('reconnecting', () => {
      this.logger.warn('Redis connection lost, clearing all cached IDs');
      this.leaderboardSyncService.clearCachedLeaderboardIDs();
      void this.syncLeaderboardIDs();
    });
  }

  private async syncLeaderboardIDs() {
    const keys = await this.redis.keys('*');
    keys.forEach((key) => this.leaderboardSyncService.addIDToCached(key));
    this.logger.log(`Synchronized ${keys.length} cached leaderboard IDs`);
  }

  async get(
    key: string,
    options: {
      limit?: number;
      page?: number;
      pageSize?: number;
    } = {},
  ): Promise<LeaderboardEntry[] | undefined> {
    const { limit = 0, page = 1, pageSize = 50 } = options;

    const start = (page - 1) * pageSize;
    if (limit > 0 && start >= limit) return undefined;

    let end: number;
    if (limit > 0) end = Math.min(start + pageSize - 1, limit - 1);
    else end = start + pageSize - 1;

    let entries: string[] = [];

    try {
      entries = await this.redis.zrevrange(key, start, end, 'WITHSCORES');
    } catch (error) {
      this.logger.error(`Error fetching leaderboard from Redis: ${error}`);
      return undefined;
    }

    const scores: LeaderboardEntry[] = [];
    for (let i = 0; i < entries.length; i += 2) {
      scores.push(LeaderboardEntry.of(entries[i], entries[i + 1]));
    }
    return scores.length > 0 ? scores : undefined;
  }

  async getRank(key: string, userId: string): Promise<number | undefined> {
    try {
      const rank = await this.redis.zrevrank(key, userId);
      return rank !== null ? rank + 1 : undefined;
    } catch (error) {
      this.logger.error(`Error fetching player rank from Redis: ${error}`);
      throw new CacheException('Error fetching player rank from Redis', error);
    }
  }

  async getRange(
    key: string,
    start: number,
    end: number,
  ): Promise<LeaderboardEntry[] | undefined> {
    let range: string[] = [];
    try {
      range = await this.redis.zrevrange(key, start, end, 'WITHSCORES');
    } catch (error) {
      const msg = `Error fetching leaderboard range from Redis`;
      this.logger.error(msg, error);
      throw new CacheException(msg, error);
    }

    const scores: LeaderboardEntry[] = [];
    for (let i = 0; i < range.length; i += 2) {
      scores.push(LeaderboardEntry.of(range[i], range[i + 1]));
    }
    return scores;
  }

  async del(key: string) {
    this.logger.debug(`Removing cached leaderboard: ${key}`);
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Error removing leaderboard from Redis: ${error}`);
      throw new CacheException('Error removing leaderboard from Redis', error);
    }
    this.leaderboardSyncService.removeIDFromCached(key);
  }

  async set(key: string, leaderboard: LeaderboardEntry[]) {
    if (!leaderboard || leaderboard.length === 0) {
      this.logger.debug(`Leaderboard ${key} is empty, skipping cache`);
      throw new CacheException('Cannot cache empty leaderboard');
    }

    const entries: number[] = [];
    for (const { score, userId } of leaderboard) entries.push(score, userId);

    if (entries.length === 0) {
      this.logger.warn(`No valid entries to cache for leaderboard ${key}`);
      throw new CacheException('No valid entries to cache');
    }

    await this.del(key);

    const msg = `Caching leaderboard ${key} with ${entries.length / 2} entries`;
    this.logger.debug(msg);
    try {
      await this.redis.zadd(key, ...entries);
    } catch (error) {
      this.logger.error(`Error caching leaderboard ${key}: ${error}`);
      throw new CacheException('Failed to cache leaderboard', error);
    }
    this.logger.debug(`Cached ${key} with ${entries.length / 2} entries`);
    this.leaderboardSyncService.addIDToCached(key);
  }

  async incrementCachedLeaderboards(userId: number, scoreDelta: number) {
    for (const key of this.leaderboardSyncService.getIncrementingLeaderboards()) {
      try {
        if (await this.redis.exists(key)) {
          await this.redis.zincrby(key, scoreDelta, userId);
        }
      } catch (error) {
        const msg = `Error incrementing user ${userId} in cached leaderboard ${key}`;
        this.logger.error(msg, error);
        throw new CacheException(msg, error);
      }
    }
  }
}
