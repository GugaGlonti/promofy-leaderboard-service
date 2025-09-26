import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LeaderboardDelta } from './entity/leaderboard-delta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaderboardSyncService } from './leaderboard-sync.service';

@Injectable()
export class LeaderboardDeltaRepository {
  private readonly logger = new Logger(LeaderboardDeltaRepository.name);

  constructor(
    @InjectRepository(LeaderboardDelta)
    private readonly deltas: Repository<LeaderboardDelta>,

    private readonly leaderboardSync: LeaderboardSyncService,
  ) {}

  async add(playerId: number, scoreDelta: number) {
    const createdAt = new Date();
    const delta = await this.deltas.save({ playerId, scoreDelta, createdAt });

    await this.deltas
      .createQueryBuilder()
      .relation(LeaderboardDelta, 'leaderboards')
      .of(delta)
      .add(this.leaderboardSync.getSyncedLeaderboards());

    return delta;
  }
}
