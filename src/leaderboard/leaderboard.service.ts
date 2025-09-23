import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LeaderboardRepository } from './leaderboard.repository';
import { PlayerScoreDto } from './dto/PlayerScore.dto';
import { PlayerPositionDto } from './dto/PlayerPosition.dto';
import { LeaderboardNotFoundException } from './exception/LeaderboardNotFound.exception';
import { AllLeaderboardsDto } from './dto/AllLeaderboards.dto';
import { DateTimeLimit } from './enum/DateTimeLimit.enum';

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
      this.logger.debug(
        `Checking Redis cache for leaderboard: ${leaderboardId}`,
      );
      if (
        startDate !== DateTimeLimit.MIN_DATE.toString() ||
        endDate !== DateTimeLimit.MAX_DATE.toString()
      ) {
        this.logger.debug(
          `Date filters applied (startDate: ${startDate}, endDate: ${endDate}), skipping Redis cache.`,
        );
      } else {
        const { success, data } =
          await this.leaderboardRepository.getLeaderboardFromRedis(
            leaderboardId,
            limit,
            page,
            pageSize,
          );
        if (success) return data;
        this.logger.debug(
          `Unable to fetch from Redis, falling back to Postgres.`,
        );
      }
    } catch (error) {
      this.logger.error(`Error fetching leaderboard from Redis:`, error);
    }

    try {
      this.logger.debug(`Fetching leaderboard from Postgres: ${leaderboardId}`);
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
    contextRadius: number,
  ): Promise<PlayerPositionDto> {
    this.logger.debug(`Fetching player position for user: ${userId}`);

    try {
      this.logger.debug(
        `Checking Redis cache for player position in leaderboard: ${leaderboardId}`,
      );
      const { success, data } =
        await this.leaderboardRepository.getPlayerPositionFromRedis(
          leaderboardId,
          userId,
          contextRadius,
        );
      if (success) return data;
      this.logger.debug(
        `Unable to fetch from Redis, falling back to Postgres.`,
      );
    } catch (error) {
      this.logger.error(`Error fetching player position from Redis:`, error);
    }

    try {
      this.logger.debug(
        `Fetching player position from Postgres: ${leaderboardId}`,
      );
      return this.leaderboardRepository.getPlayerPositionFromPostgres(
        leaderboardId,
        userId,
        contextRadius,
      );
    } catch (error) {
      this.logger.error(`Error fetching player position from Postgres:`, error);
    }

    throw new LeaderboardNotFoundException(leaderboardId);
  }

  async getAllLeaderboards(): Promise<AllLeaderboardsDto> {
    this.logger.debug(`Fetching all leaderboards`);

    try {
      return this.leaderboardRepository.getAllLeaderboards();
    } catch (error) {
      this.logger.error(`Error fetching all leaderboards:`, error);
    }

    throw new NotFoundException('No leaderboards found');
  }
}
