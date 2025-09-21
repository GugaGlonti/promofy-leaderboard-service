import { Injectable, Logger } from '@nestjs/common';
import { LeaderboardRepository } from './leaderboard.repository';
import { PlayerScoreDto } from '../common/dto/PlayerScore.dto';
import { PlayerPositionDto } from '../common/dto/PlayerPosition.dto';
@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  getAllTimeLeaderboard(
    limit: number,
    page: number,
    pageSize: number,
  ): Promise<PlayerScoreDto[]> {
    this.logger.debug(
      `Fetching all-time leaderboard: limit=${limit}, page=${page}, pageSize=${pageSize}`,
    );
    return this.leaderboardRepository.getAllTimeLeaderboard(
      limit,
      (page - 1) * pageSize,
    );
  }

  getPlayerPosition(
    userId: string,
    contextSize: number,
  ): Promise<PlayerPositionDto> {
    return this.leaderboardRepository.getPlayerPosition(userId, contextSize);
  }

  async getLeaderboardById(id: string): Promise<PlayerScoreDto[]> {
    this.logger.debug(`Fetching leaderboard for id: ${id}`);
    // get leaderboard by leaderboard-period i guess ...
    return await Promise.resolve([]);
  }

  async getCustomPeriodLeaderboard(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    startDate: string,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    endDate: string,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    limit: number,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    page: number,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pageSize: number,
  ): Promise<any[]> {
    return await Promise.resolve([]);
  }
}
