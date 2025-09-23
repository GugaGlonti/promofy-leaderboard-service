import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LeaderboardRepository } from './leaderboard.repository';
import { PlayerScoreDto } from './dto/PlayerScore.dto';
import { PlayerPositionDto } from './dto/PlayerPosition.dto';
import { LeaderboardNotFoundException } from './exception/LeaderboardNotFound.exception';
import { AllLeaderboardsDto } from './dto/AllLeaderboards.dto';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  async getLeaderboard(
    leaderboardId: string,
    startDate: string,
    endDate: string,
    limit: number,
    page: number,
    pageSize: number,
  ): Promise<PlayerScoreDto[]> {
    this.logger.debug(`Fetching leaderboard for id: ${leaderboardId}`);

    try {
      if (!startDate && !endDate) {
        // Only use Redis cache for unfiltered requests
        const { success, data } =
          await this.leaderboardRepository.getLeaderboardFromRedis(
            leaderboardId,
            limit,
            page,
            pageSize,
          );
        if (success) return data;
      }
    } catch (error) {
      this.logger.error(`Error fetching leaderboard from Redis:`, error);
    }

    try {
      return this.leaderboardRepository.getLeaderboardFromPostgres(
        leaderboardId,
        startDate,
        endDate,
        limit,
        page,
        pageSize,
      );
    } catch (error) {
      this.logger.error(`Error fetching leaderboard from Postgres:`, error);
    }

    throw new LeaderboardNotFoundException(leaderboardId);
  }

  async getPlayerPosition(
    leaderboardId: string,
    userId: string,
    contextSize: number,
  ): Promise<PlayerPositionDto> {
    try {
      const { success, data } =
        await this.leaderboardRepository.getPlayerPositionFromRedis(
          leaderboardId,
          userId,
          contextSize,
        );
      if (success) return data;
    } catch (error) {
      this.logger.error(`Error fetching player position from Redis:`, error);
    }

    try {
      return this.leaderboardRepository.getPlayerPositionFromPostgres(
        leaderboardId,
        userId,
        contextSize,
      );
    } catch (error) {
      this.logger.error(`Error fetching player position from Postgres:`, error);
    }

    throw new LeaderboardNotFoundException(leaderboardId);
  }

  async getAllLeaderboards(): Promise<AllLeaderboardsDto> {
    try {
      return this.leaderboardRepository.getAllLeaderboards();
    } catch (error) {
      this.logger.error(`Error fetching all leaderboards:`, error);
    }

    throw new NotFoundException('No leaderboards found');
  }
}
