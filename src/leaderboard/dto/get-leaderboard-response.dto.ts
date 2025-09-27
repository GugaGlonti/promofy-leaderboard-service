import { ApiProperty, ApiResponseOptions } from '@nestjs/swagger';
import { LeaderboardEntry } from './leaderboard-entry.dto';

export class GetLeaderboardResponse {
  @ApiProperty({ type: [LeaderboardEntry] })
  public readonly entries: LeaderboardEntry[];

  @ApiProperty({ type: Number })
  public readonly totalEntries: number;

  constructor(entries: LeaderboardEntry[], totalEntries: number) {
    this.entries = entries;
    this.totalEntries = totalEntries;
  }

  static openApi(): ApiResponseOptions {
    return {
      description: 'Retrieve leaderboard entries with optional filters',
      type: GetLeaderboardResponse,
      example: new GetLeaderboardResponse(LeaderboardEntry.example(3), 3),
    };
  }
}
