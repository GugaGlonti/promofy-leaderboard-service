import { PlayerScoreDto } from './PlayerScore.dto';

export class PlayerPositionDto {
  constructor(
    private readonly position: number,
    private readonly totalScore: number,

    private readonly contextSize: number,
    private readonly above: PlayerScoreDto[],
    private readonly below: PlayerScoreDto[],
  ) {}

  static empty(): PlayerPositionDto {
    return new PlayerPositionDto(-1, -1, -1, [], []);
  }
}
