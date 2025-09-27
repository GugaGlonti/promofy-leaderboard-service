import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntry {
  @ApiProperty({ type: Number, description: 'Unique identifier of the user' })
  public readonly userId: number;

  @ApiProperty({ type: Number, description: 'Score of the user' })
  public readonly score: number;

  constructor(userId: number, score: number) {
    this.userId = userId;
    this.score = score;
  }

  static of(userId: string, totalScore: string): LeaderboardEntry;
  static of(userId: number, totalScore: number): LeaderboardEntry;
  static of(
    userId: string | number,
    totalScore: string | number,
  ): LeaderboardEntry {
    return new LeaderboardEntry(Number(userId), Number(totalScore));
  }

  static example(n = 1): LeaderboardEntry[] {
    if (n < 1) throw new Error('n must be at least 1');

    return Array.from({ length: n }, (_, i) =>
      LeaderboardEntry.of(i + 1, Math.floor(Math.random() * 1000)),
    );
  }
}
