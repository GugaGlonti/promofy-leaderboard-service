export class LeaderboardEntry {
  constructor(
    public readonly userId: number,
    public readonly totalScore: number,
  ) {}

  static of(userId: string, totalScore: string): LeaderboardEntry;
  static of(userId: number, totalScore: number): LeaderboardEntry;
  static of(
    userId: string | number,
    totalScore: string | number,
  ): LeaderboardEntry {
    return new LeaderboardEntry(
      Number(userId),
      typeof totalScore === 'string' ? Number(totalScore) : totalScore,
    );
  }
}
