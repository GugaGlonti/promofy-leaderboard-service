import { Injectable } from '@nestjs/common';

import { NewPlayerEvent } from '../common/event/new-player.event';
import { ScoreUpdateEvent } from '../common/event/score-update.event';
import { LeaderboardRepository } from '../leaderboard/leaderboard.repository';

@Injectable()
export class StreamProcessingService {
  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  initializePlayer(value: NewPlayerEvent): any {
    return this.leaderboardRepository.initializePlayer(
      value.userId,
      value.newScore,
    );
  }

  updateScore(value: ScoreUpdateEvent): any {
    return this.leaderboardRepository.updateScore(
      value.userId,
      value.scoreDelta,
    );
  }
}
