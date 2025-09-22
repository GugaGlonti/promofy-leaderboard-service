import { Module, Provider } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardRepository } from './leaderboard.repository';
import Redis from 'ioredis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardDelta } from '../common/entity/leaderboard-delta.entity';
import { LeaderboardCache } from './leaderboard-cache';
import { LeaderboardController } from './leaderboard.controller';
import { Leaderboard } from '../common/entity/leaderboard.entity';

const REDIS_HOST = 'localhost';
const REDIS_PORT = 6379;

export type RedisClient = Redis;

const RedisProvider: Provider<RedisClient> = {
  provide: 'REDIS_CLIENT',
  useFactory: (): RedisClient => {
    return new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
    });
  },
};

@Module({
  imports: [TypeOrmModule.forFeature([LeaderboardDelta, Leaderboard])],
  providers: [
    LeaderboardService,
    LeaderboardRepository,
    RedisProvider,
    LeaderboardCache,
  ],
  exports: [LeaderboardService, LeaderboardRepository],
  controllers: [LeaderboardController],
})
export class LeaderboardModule {}
