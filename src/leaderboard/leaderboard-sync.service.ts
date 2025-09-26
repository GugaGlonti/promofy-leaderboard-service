import { Injectable, Logger } from '@nestjs/common';
import { Leaderboard } from './entity/leaderboard.entity';
import { LeaderboardStatusDto } from './dto/leaderboard-status.dto';

@Injectable()
export class LeaderboardSyncService {
  private readonly logger = new Logger(LeaderboardSyncService.name);

  private readonly cachedLeaderboardIDs = new Set<string>();
  private readonly activeLeaderboards = new Map<string, Leaderboard>();

  private readonly allLeaderboards = new Map<string, Leaderboard>();
  private readonly previousLeaderboards = new Map<string, Leaderboard>();

  public getIncrementingLeaderboards(): string[] {
    const actives = Array.from(this.activeLeaderboards.keys());
    return actives.filter((id) => this.cachedLeaderboardIDs.has(id));
  }

  public addToActive(leaderboard: Leaderboard) {
    this.logger.debug(`Adding to active: ${leaderboard.toString()}`);
    this.allLeaderboards.set(leaderboard.id, leaderboard);
    this.activeLeaderboards.set(leaderboard.id, leaderboard);
  }

  public addToInactive(leaderboard: Leaderboard) {
    this.logger.debug(`Adding to previous: ${leaderboard.toString()}`);
    this.allLeaderboards.set(leaderboard.id, leaderboard);
    this.previousLeaderboards.set(leaderboard.id, leaderboard);
  }

  public clearCurrentLeaderboards() {
    this.logger.debug('Clearing all leaderboard sets');
    this.allLeaderboards.clear();
    this.activeLeaderboards.clear();
    this.previousLeaderboards.clear();
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
      this.getIncrementingLeaderboards(),
      Array.from(this.allLeaderboards.values()),
      Array.from(this.activeLeaderboards.values()),
      Array.from(this.previousLeaderboards.values()),
    );
  }
}
