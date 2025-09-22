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
}
