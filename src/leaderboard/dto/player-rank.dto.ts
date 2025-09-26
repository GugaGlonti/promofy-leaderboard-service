import { LeaderboardEntry } from './leaderboard-entry.dto';

export class PlayerRankDto {
  constructor(
    private readonly position: number,
    private readonly totalScore: number,
    private readonly above: LeaderboardEntry[],
    private readonly below: LeaderboardEntry[],
  ) {}

  static empty(): PlayerRankDto {
    return new PlayerRankDto(-1, -1, [], []);
  }

  static ofScores(
    userId: string,
    rank: number,
    scores: LeaderboardEntry[],
  ): PlayerRankDto {
    const player = scores.findIndex((p) => p.userId === Number(userId));
    const playerScore = scores[player].totalScore;
    const before = scores.slice(0, player);
    const after = scores.slice(player + 1);

    return new PlayerRankDto(rank, playerScore, before, after);
  }
}
