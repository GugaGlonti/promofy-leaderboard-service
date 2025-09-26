import { Injectable, Logger } from '@nestjs/common';
import { Leaderboard } from './entity/leaderboard.entity';

@Injectable()
export class LeaderboardSyncService {
  private readonly logger = new Logger(LeaderboardSyncService.name);

  private readonly cachedLeaderboardIDs = new Set<string>();
  private readonly allLeaderboards = new Map<string, Leaderboard>();
  private readonly currentLeaderboards = new Map<string, Leaderboard>();
  private readonly previousLeaderboards = new Map<string, Leaderboard>();

  public getCachedLeaderboardIDs(): string[] {
    return Array.from(this.cachedLeaderboardIDs);
  }

  public clearCachedLeaderboardIDs() {
    this.logger.debug('Clearing all cached leaderboard IDs');
    this.cachedLeaderboardIDs.clear();
  }

  public getAllTimeLeaderboards(): Leaderboard[] {
    return Array.from(this.allLeaderboards.values());
  }

  public getCurrentLeaderboards(): Leaderboard[] {
    return Array.from(this.currentLeaderboards.values());
  }

  public getPreviousLeaderboards(): Leaderboard[] {
    return Array.from(this.previousLeaderboards.values());
  }

  public getSyncedLeaderboards(): string[] {
    return Array.from(
      new Set([
        ...this.currentLeaderboards.keys(),
        ...this.cachedLeaderboardIDs,
      ]),
    );
  }

  public clearCurrentLeaderboards() {
    this.logger.debug('Clearing all leaderboard sets');
    this.allLeaderboards.clear();
    this.currentLeaderboards.clear();
    this.previousLeaderboards.clear();
  }

  public addToCurrent(leaderboard: Leaderboard) {
    if (!leaderboard?.id) {
      this.logger.warn('Attempted to add invalid leaderboard to current');
      return;
    }

    this.logger.debug(`Adding to current: ${leaderboard.toString()}`);
    this.allLeaderboards.set(leaderboard.id, leaderboard);
    this.currentLeaderboards.set(leaderboard.id, leaderboard);
  }

  public addToPrevious(leaderboard: Leaderboard) {
    if (!leaderboard?.id) {
      this.logger.warn('Attempted to add invalid leaderboard to previous');
      return;
    }

    this.logger.debug(`Adding to previous: ${leaderboard.toString()}`);
    this.allLeaderboards.set(leaderboard.id, leaderboard);
    this.previousLeaderboards.set(leaderboard.id, leaderboard);
  }

  public addIDToCached(leaderboardId: string) {
    if (!leaderboardId?.trim()) {
      this.logger.warn('Attempted to add invalid leaderboard ID to cache');
      return;
    }

    this.logger.debug(`Adding ID to cached: ${leaderboardId}`);
    this.cachedLeaderboardIDs.add(leaderboardId);
  }

  public removeIDFromCached(leaderboardId: string) {
    if (!leaderboardId?.trim()) {
      this.logger.warn('Attempted to remove invalid leaderboard ID from cache');
      return;
    }

    this.logger.debug(`Removing ID from cached: ${leaderboardId}`);
    this.cachedLeaderboardIDs.delete(leaderboardId);
  }
}
