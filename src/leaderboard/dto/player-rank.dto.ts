import { ApiProperty, ApiResponseOptions } from '@nestjs/swagger';
import { LeaderboardEntry } from './leaderboard-entry.dto';

export class PlayerRankDto {
  @ApiProperty({
    type: Number,
    description: 'Player position in the leaderboard',
  })
  public readonly position: number;

  @ApiProperty({
    type: Number,
    description: 'Total score of the player',
  })
  public readonly totalScore: number;

  @ApiProperty({
    type: [LeaderboardEntry],
    description: 'Players ranked above',
  })
  public readonly above: LeaderboardEntry[];

  @ApiProperty({
    type: [LeaderboardEntry],
    description: 'Players ranked below',
  })
  public readonly below: LeaderboardEntry[];

  constructor(
    position: number,
    totalScore: number,
    above: LeaderboardEntry[],
    below: LeaderboardEntry[],
  ) {
    this.position = position;
    this.totalScore = totalScore;
    this.above = above;
    this.below = below;
  }

  static empty(): PlayerRankDto {
    return new PlayerRankDto(-1, -1, [], []);
  }

  static ofScores(
    userId: string,
    rank: number,
    scores: LeaderboardEntry[],
  ): PlayerRankDto {
    const playerIndex = scores.findIndex((p) => p.userId === Number(userId));
    if (playerIndex === -1) return PlayerRankDto.empty();

    const playerScore = scores[playerIndex].score;
    const before = scores.slice(0, playerIndex);
    const after = scores.slice(playerIndex + 1);

    return new PlayerRankDto(rank, playerScore, before, after);
  }

  static openApi(): ApiResponseOptions {
    return {
      description: 'Retrieve player rank information',
      type: PlayerRankDto,
      example: new PlayerRankDto(
        10,
        1500,
        LeaderboardEntry.example(3),
        LeaderboardEntry.example(3),
      ),
    };
  }
}
