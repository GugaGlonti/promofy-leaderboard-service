export class PlayerScoreDto {
  constructor(
    private readonly userId: number,
    private readonly totalScore: number,
  ) {}

  getUserId() {
    return this.userId;
  }

  getScore() {
    return this.totalScore;
  }

  static of(userId: string, totalScore: string): PlayerScoreDto;
  static of(userId: number, totalScore: number): PlayerScoreDto;
  static of(
    userId: string | number,
    totalScore: string | number,
  ): PlayerScoreDto {
    return new PlayerScoreDto(
      Number(userId),
      typeof totalScore === 'string' ? Number(totalScore) : totalScore,
    );
  }
}
