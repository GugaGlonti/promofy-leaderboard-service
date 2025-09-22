import { Injectable, Logger } from '@nestjs/common';
import { LeaderboardRepository } from './leaderboard.repository';
import { PlayerScoreDto } from '../common/dto/PlayerScore.dto';
import { PlayerPositionDto } from '../common/dto/PlayerPosition.dto';
import { LeaderboardNotFoundException } from '../common/exception/LeaderboardNotFound.exception';
import { AllLeaderboardsDto } from '../common/dto/AllLeaderboards.dto';
@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  async getLeaderboard(
    id: string,
    startDate: string,
    endDate: string,
    limit: number,
    page: number,
    pageSize: number,
  ): Promise<PlayerScoreDto[]> {
    this.logger.debug(`Fetching leaderboard for id: ${id}`);

    try {
      const { success, data } =
        await this.leaderboardRepository.getLeaderboardFromRedis(
          id,
          startDate,
          endDate,
          limit,
          page,
          pageSize,
        );
      if (success) return data;
    } catch (error) {
      this.logger.error(`Error fetching leaderboard from Redis:`, error);
    }

    try {
      return this.leaderboardRepository.getLeaderboardFromPostgres(
        id,
        startDate,
        endDate,
        limit,
        page,
        pageSize,
      );
    } catch (error) {
      this.logger.error(`Error fetching leaderboard from Postgres:`, error);
    }

    throw new LeaderboardNotFoundException(id);
  }

  getPlayerPosition(
    userId: string,
    contextSize: number,
  ): Promise<PlayerPositionDto> {
    return this.leaderboardRepository.getPlayerPositionFromRedis(
      userId,
      contextSize,
    );
  }

  async getAllLeaderboards(): Promise<AllLeaderboardsDto> {
    return this.leaderboardRepository.getAllLeaderboards();
  }
}
