import { Injectable, Logger, Scope } from '@nestjs/common';
import { Leaderboard } from './entity/leaderboard.entity';
import { LeaderboardStatusDto } from './dto/leaderboard-status.dto';

@Injectable({ scope: Scope.DEFAULT })
export class LeaderboardSyncService {
  private readonly logger = new Logger(LeaderboardSyncService.name);

  private readonly cachedLeaderboardIDs = new Set<string>();
  private readonly activeLeaderboards = new Map<string, Leaderboard>();
  private readonly inactiveLeaderboards = new Map<string, Leaderboard>();

  public getActiveLeaderboards(): Leaderboard[] {
    return Array.from(this.activeLeaderboards.values());
  }

  public getActiveAndCachedLeaderboards(): string[] {
    const actives = Array.from(this.activeLeaderboards.keys());
    return actives.filter((id) => this.cachedLeaderboardIDs.has(id));
  }

  public addToActive(leaderboard: Leaderboard) {
    this.logger.debug(`Adding to active: ${leaderboard.toString()}`);
    this.activeLeaderboards.set(leaderboard.id, leaderboard);
  }

  public addToInactive(leaderboard: Leaderboard) {
    this.logger.debug(`Adding to previous: ${leaderboard.toString()}`);
    this.inactiveLeaderboards.set(leaderboard.id, leaderboard);
  }

  public clearActiveLeaderboards() {
    this.logger.debug('Clearing all leaderboard sets');
    this.activeLeaderboards.clear();
    this.inactiveLeaderboards.clear();
  }

  public addIDToCached(leaderboardId: string) {
    this.logger.debug(`Adding ID to cached: ${leaderboardId}`);
    this.cachedLeaderboardIDs.add(leaderboardId);
  }

  public removeIDFromCached(leaderboardId: string) {
    this.logger.debug(`Removing ID from cached: ${leaderboardId}`);
    this.cachedLeaderboardIDs.delete(leaderboardId);
  }

  public clearCachedLeaderboardIDs() {
    this.logger.debug('Clearing all cached leaderboard IDs');
    this.cachedLeaderboardIDs.clear();
  }

  public getStatus(): LeaderboardStatusDto {
    return new LeaderboardStatusDto(
      Array.from(this.cachedLeaderboardIDs),
      Array.from(this.activeLeaderboards.values()),
      Array.from(this.inactiveLeaderboards.values()),
    );
  }
}
