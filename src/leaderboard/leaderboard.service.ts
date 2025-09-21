import { Injectable } from '@nestjs/common';
import { LeaderboardRepository } from './leaderboard.repository';

@Injectable()
export class LeaderboardService {
  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  initializePlayer(): any {
    return this.leaderboardRepository.initializePlayer();
  }

  updateScore(): any {
    return this.leaderboardRepository.updateScore();
  }
}
