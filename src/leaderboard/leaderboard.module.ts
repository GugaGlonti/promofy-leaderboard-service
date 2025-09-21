import { Module, Provider } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardRepository } from './leaderboard.repository';
import Redis from 'ioredis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardDelta } from '../common/entity/leaderboard-delta.entity';
import { LeaderboardKeys } from './leaderboard-keys';
import { LeaderboardController } from './leaderboard.controller';

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
  imports: [TypeOrmModule.forFeature([LeaderboardDelta])],
  providers: [
    LeaderboardService,
    LeaderboardRepository,
    RedisProvider,
    LeaderboardKeys,
  ],
  exports: [LeaderboardService, LeaderboardRepository],
  controllers: [LeaderboardController],
})
export class LeaderboardModule {}
