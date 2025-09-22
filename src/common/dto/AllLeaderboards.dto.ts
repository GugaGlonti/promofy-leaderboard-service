export class AllLeaderboardsDto {
  constructor(
    public allTime: {
      UUID: string;
      URL: string;
    },

    public weeklies: {
      UUID: string;
      URL: string;
    }[],

    public dailies: {
      UUID: string;
      URL: string;
    }[],
  ) {}

  static ofUUIDs(allTime: string, weeklies: string[], dailies: string[]) {
    return new AllLeaderboardsDto(
      {
        UUID: allTime,
        URL: `localhost:3000/leaderboards/${allTime}`,
      },
      weeklies.map((uuid) => ({
        UUID: uuid,
        URL: `localhost:3000/leaderboards/${uuid}`,
      })),
      dailies.map((uuid) => ({
        UUID: uuid,
        URL: `localhost:3000/leaderboards/${uuid}`,
      })),
    );
  }
}
