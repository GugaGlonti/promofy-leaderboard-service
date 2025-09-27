import { Injectable, Logger } from '@nestjs/common';

import { LeaderboardEntry } from './dto/leaderboard-entry.dto';
import { PlayerRankDto } from './dto/player-rank.dto';
import { LeaderboardNotFoundException } from './exception/LeaderboardNotFound.exception';
import { CacheService } from './cache.service';
import { GetLeaderboardOptions } from './dto/get-leaderboard-options.dto';
import { LeaderboardRepository } from './leaderboard.repository';
import { LeaderboardStatusDto } from './dto/leaderboard-status.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeaderboardSyncService } from './leaderboard-sync.service';
import { UTCUtils } from './utc-utils';
import { Leaderboard } from './entity/leaderboard.entity';
import { PlayerRankNotFoundException } from './exception/PlayerRankNotFound.exception';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    private readonly leaderboards: LeaderboardRepository,
    private readonly cache: CacheService,
    private readonly leaderboardSync: LeaderboardSyncService,
  ) {}

  /**
   * Fetches a leaderboard by its ID, with optional filtering and pagination.
   * @param id The ID of the leaderboard to fetch.
   * @param options Options for filtering and pagination.
   * @returns The leaderboard entries.
   */
  async getLeaderboard(
    id: string,
    {
      startDate,
      endDate,
      limit,
      page,
      pageSize,
      skipRedis,
    }: GetLeaderboardOptions,
  ): Promise<LeaderboardEntry[]> {
    this.logger.debug(`Fetching leaderboard for id: ${id}`);
    const isCachable = !UTCUtils.hasDateFilter(startDate, endDate);

    if (!isCachable || skipRedis) {
      const options = { startDate, endDate, limit, page, pageSize };
      return this.leaderboards.getWithOptions(id, options);
    }

    const options = { limit, page, pageSize };
    const cachedLeaderboard = await this.cache.get(id, options);
    if (cachedLeaderboard) return cachedLeaderboard;

    const leaderboard = await this.leaderboards.get(id);
    if (!leaderboard) throw new LeaderboardNotFoundException(id, 'database');

    await this.cache.set(id, leaderboard);

    const reCachedLeaderboard = await this.cache.get(id, options);
    if (!reCachedLeaderboard)
      throw new LeaderboardNotFoundException(id, 'cache');

    return reCachedLeaderboard;
  }

  /**
   * Fetches the position of a player in a leaderboard, along with surrounding context.
   * @param id The ID of the leaderboard.
   * @param userId The ID of the player.
   * @param contextRadius The number of entries to include before and after the player's position.
   * @returns The player's position and surrounding context.
   */
  async getPlayerPosition(
    id: string,
    userId: string,
    contextRadius: number,
  ): Promise<PlayerRankDto> {
    this.logger.debug(`Fetching player position for user: ${userId}`);

    let playerRank = await this.cache.getRank(id, userId);
    if (!playerRank) {
      const leaderboard = await this.leaderboards.get(id);
      if (!leaderboard) throw new LeaderboardNotFoundException(id, 'database');

      await this.cache.set(id, leaderboard);
      playerRank = await this.cache.getRank(id, userId);

      if (!playerRank) throw new PlayerRankNotFoundException(id, userId);
    }

    const start = Math.max(playerRank - contextRadius, 0);
    const end = playerRank + contextRadius;

    let scores = await this.cache.getRange(id, start, end);
    if (!scores) {
      const leaderboard = await this.leaderboards.get(id);
      if (!leaderboard) throw new LeaderboardNotFoundException(id, 'database');

      await this.cache.set(id, leaderboard);
      scores = await this.cache.getRange(id, start, end);
    }
    if (!scores) throw new LeaderboardNotFoundException(id, 'cache');

    return PlayerRankDto.ofScores(userId, playerRank + 1, scores);
  }

  /**
   * Fetches the status of all leaderboards, including cached IDs and current/previous/all-time leaderboards.
   * @returns The status of all leaderboards.
   */
  getAllLeaderboards(): LeaderboardStatusDto {
    return this.leaderboardSync.getStatus();
  }

  async onModuleInit() {
    await this.createCurrentLeaderboards();
    await this.refreshCurrentLeaderboards();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'UTC' })
  async handleCron() {
    await this.createCurrentLeaderboards();
    await this.refreshCurrentLeaderboards();
  }

  private async createCurrentLeaderboards() {
    this.logger.debug('Creating current leaderboards if not exist');
    const leaderboards: Partial<Leaderboard>[] = [
      Leaderboard.DAILY(),
      Leaderboard.WEEKLY(),
      Leaderboard.MONTHLY(),
      Leaderboard.ALL_TIME(),
    ];
    await this.leaderboards.insertOrIgnore(leaderboards);
  }

  private async refreshCurrentLeaderboards() {
    this.logger.debug('Refreshing current leaderboard IDs');
    const leaderboards = await this.leaderboards.findAll();

    this.logger.debug(`Refreshed current leaderboards:`);
    this.leaderboardSync.clearActiveLeaderboards();
    for (const lb of leaderboards) {
      if (UTCUtils.todayIsInRange(lb.startDate, lb.endDate)) {
        this.leaderboardSync.addToActive(lb);
      } else {
        this.leaderboardSync.addToInactive(lb);
      }
    }
    const status = this.leaderboardSync.getStatus();
    this.logger.debug(`LeaderboardSync status: `, status);
  }
}
