import { Injectable } from '@nestjs/common';

import { NewPlayerEvent } from '../common/event/new-player.event';
import { ScoreUpdateEvent } from '../common/event/score-update.event';
import { CacheService } from './cache.service';
import { LeaderboardDeltaRepository } from './leaderboard-delta.repository';

@Injectable()
export class StreamProcessingService {
  constructor(
    private readonly leaderboardDeltaRepository: LeaderboardDeltaRepository,
    private readonly cache: CacheService,
  ) {}

  async initializePlayer(value: NewPlayerEvent) {
    const { userId, newScore } = value;

    await this.leaderboardDeltaRepository.add(userId, newScore);
    await this.cache.incrementCachedLeaderboards(userId, newScore);
  }

  async updateScore(value: ScoreUpdateEvent) {
    const { userId, scoreDelta } = value;
    await this.leaderboardDeltaRepository.add(userId, scoreDelta);
    await this.cache.incrementCachedLeaderboards(userId, scoreDelta);
  }
}
