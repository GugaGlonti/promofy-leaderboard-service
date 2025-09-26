import { ConfigService } from '@nestjs/config';
import { Module, Provider } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardRepository } from './leaderboard.repository';
import Redis from 'ioredis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardDelta } from './entity/leaderboard-delta.entity';
import { LeaderboardCache } from './leaderboard-cache';
import { LeaderboardController } from './leaderboard.controller';
import { Leaderboard } from './entity/leaderboard.entity';

export type RedisClient = Redis;

export const RedisProvider: Provider<RedisClient> = {
  inject: [ConfigService],
  provide: 'REDIS_CLIENT',
  useFactory: (env: ConfigService): RedisClient => {
    return new Redis({
      host: env.getOrThrow<string>('REDIS_HOST'),
      port: env.getOrThrow<number>('REDIS_PORT'),
      maxRetriesPerRequest: env.getOrThrow<number | null>('REDIS_MAX_RETRIES'),
      enableOfflineQueue: env.getOrThrow<boolean>('REDIS_ENABLE_OFFLINE_QUEUE'),
      autoResubscribe: env.getOrThrow<boolean>('REDIS_AUTO_RECONNECT'),
      keepAlive: env.getOrThrow<number>('REDIS_KEEP_ALIVE'),
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
