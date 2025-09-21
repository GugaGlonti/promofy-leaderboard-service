import { Injectable } from '@nestjs/common';
@Injectable()
export class LeaderboardService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getDailyLeaderboard(limit: number): any {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getWeeklyLeaderboard(limit: number): any {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAllTimeLeaderboard(limit: number): any {}

  getCustomPeriodLeaderboard(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    periodFrom: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    periodTo: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    limit: number,
  ): any {}
}
