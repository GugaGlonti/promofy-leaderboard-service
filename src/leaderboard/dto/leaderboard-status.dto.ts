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
  activeLeaderboards: DisplayLeaderboard[];
  inactiveLeaderboards: DisplayLeaderboard[];

  constructor(
    cachedLeaderboards: string[],
    activeLeaderboards: Leaderboard[],
    inactiveLeaderboards: Leaderboard[],
  ) {
    this.cachedLeaderboards = cachedLeaderboards;
    this.activeLeaderboards = activeLeaderboards.map(leaderboardToDisplay);
    this.inactiveLeaderboards = inactiveLeaderboards.map(leaderboardToDisplay);
  }
}

function leaderboardToDisplay(lb: Leaderboard): DisplayLeaderboard {
  const { id, type, startDate, endDate } = lb;
  const dateRange = `${startDate.toString()} - ${endDate.toString()}`;
  return {
    id,
    type,
    dateRange: dateRange.replace(' (Central European Summer Time)', ''),
    url: `localhost:3000/leaderboards/${id}`,
  };
}
