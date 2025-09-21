import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Leaderboard } from './entity/leaderboard.entity';
import { Repository } from 'typeorm';
import type { RedisClient } from './leaderboard.module';

@Injectable()
export class LeaderboardRepository {
  private readonly logger = new Logger(LeaderboardRepository.name);

  constructor(
    @InjectRepository(Leaderboard)
    private readonly leaderboardRepository: Repository<Leaderboard>,

    @Inject('REDIS_CLIENT')
    private readonly redisClient: RedisClient,
  ) {}

  initializePlayer(): any {
    this.logger.debug('Initialize player in Postgres and Redis');
    return;
  }

  updateScore(): any {
    this.logger.debug('Update player score in Postgres and Redis');
    return;
  }
}
