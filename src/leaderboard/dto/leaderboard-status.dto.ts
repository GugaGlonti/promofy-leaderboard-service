import { Leaderboard } from '../entity/leaderboard.entity';
import { LeaderboardType } from '../enum/leaderboard-type.enum';

interface DisplayLeaderboard {
  id: string;
  type: LeaderboardType;
  dateRange: string;
  url: string;
}

export class LeaderboardStatusDto {
  cachedLeaderboards: string[];
  currentLeaderboards: DisplayLeaderboard[];
  previousLeaderboards: DisplayLeaderboard[];
  allLeaderboards: DisplayLeaderboard[];

  constructor(
    cachedLeaderboards: string[],
    currentLeaderboards: Leaderboard[],
    previousLeaderboards: Leaderboard[],
    allLeaderboards: Leaderboard[],
  ) {
    this.cachedLeaderboards = cachedLeaderboards;
    this.currentLeaderboards = currentLeaderboards.map(leaderboardToDisplay);
    this.previousLeaderboards = previousLeaderboards.map(leaderboardToDisplay);
    this.allLeaderboards = allLeaderboards.map(leaderboardToDisplay);
  }
}

function leaderboardToDisplay(lb: Leaderboard): DisplayLeaderboard {
  const { id, type, startDate, endDate } = lb;
  const dateRange = `${startDate} - ${endDate}`;
  return {
    id,
    type,
    dateRange: dateRange.replace(' (Central European Summer Time)', ''),
    url: `localhost:3000/leaderboards/${id}`,
  };
}
