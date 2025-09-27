import { ApiProperty, ApiResponseOptions } from '@nestjs/swagger';
import { Leaderboard } from '../entity/leaderboard.entity';
import { LeaderboardType } from '../enum/leaderboard-type.enum';

export class DisplayLeaderboardDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ enum: LeaderboardType })
  type: LeaderboardType;

  @ApiProperty({ type: String })
  dateRange: string;

  @ApiProperty({ type: String })
  url: string;

  constructor(
    id: string,
    type: LeaderboardType,
    dateRange: string,
    url: string,
  ) {
    this.id = id;
    this.type = type;
    this.dateRange = dateRange;
    this.url = url;
  }
}

export class LeaderboardStatusDto {
  @ApiProperty({ type: [String] })
  cachedLeaderboards: string[];

  @ApiProperty({ type: [DisplayLeaderboardDto] })
  activeLeaderboards: DisplayLeaderboardDto[];

  @ApiProperty({ type: [DisplayLeaderboardDto] })
  inactiveLeaderboards: DisplayLeaderboardDto[];

  constructor(
    cachedLeaderboards: string[],
    activeLeaderboards: Leaderboard[] | DisplayLeaderboardDto[],
    inactiveLeaderboards: Leaderboard[] | DisplayLeaderboardDto[],
  ) {
    this.cachedLeaderboards = cachedLeaderboards;
    this.activeLeaderboards = activeLeaderboards.map(leaderboardToDisplay);
    this.inactiveLeaderboards = inactiveLeaderboards.map(leaderboardToDisplay);
  }

  static openApi(): ApiResponseOptions {
    return {
      description: 'Retrieve status of leaderboards',
      type: LeaderboardStatusDto,
      example: new LeaderboardStatusDto(
        ['abc123', 'def456'],
        [
          new DisplayLeaderboardDto(
            'weekly-001',
            LeaderboardType.WEEKLY,
            '2024-01-01 - 2024-01-07',
            'localhost:3000/leaderboards/weekly-001',
          ),
        ],
        [],
      ),
    };
  }
}

function leaderboardToDisplay(
  lb: Leaderboard | DisplayLeaderboardDto,
): DisplayLeaderboardDto {
  if (lb instanceof DisplayLeaderboardDto) return lb;

  const { id, type, startDate, endDate } = lb;
  const dateRange = `${startDate.toISOString()} - ${endDate.toISOString()}`;
  return new DisplayLeaderboardDto(
    id,
    type,
    dateRange.replace(' (Central European Summer Time)', ''),
    `localhost:3000/leaderboards/${id}`,
  );
}
