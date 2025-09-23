import { Leaderboard } from '../entity/leaderboard.entity';

export class AllLeaderboardsDto {
  constructor(
    public allTime: {
      UUID: string;
      URL: string;
    },

    public weeklies: {
      UUID: string;
      URL: string;
      week: string;
    }[],

    public dailies: {
      UUID: string;
      URL: string;
      day?: string;
    }[],
  ) {}

  static ofLeaderboards(
    allTime: Leaderboard,
    weeklies: Leaderboard[],
    dailies: Leaderboard[],
  ) {
    return new AllLeaderboardsDto(
      {
        UUID: allTime.id,
        URL: `localhost:3000/leaderboards/${allTime.id}`,
      },
      weeklies.map((lb) => ({
        UUID: lb.id,
        URL: `localhost:3000/leaderboards/${lb.id}`,
        week: `${lb.year}-W${lb.weekNumber}`,
      })),
      dailies.map((lb) => ({
        UUID: lb.id,
        URL: `localhost:3000/leaderboards/${lb.id}`,
        day: lb.date,
      })),
    );
  }
}
