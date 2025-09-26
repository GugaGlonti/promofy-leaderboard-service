import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { CacheService } from './cache.service';
import { LeaderboardDelta } from './entity/leaderboard-delta.entity';
import { Leaderboard } from './entity/leaderboard.entity';
import { LeaderboardDeltaRepository } from './leaderboard-delta.repository';
import { LeaderboardSyncService } from './leaderboard-sync.service';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardRepository } from './leaderboard.repository';
import { LeaderboardService } from './leaderboard.service';
import { StreamProcessingController } from './stream-processing.controller';
import { StreamProcessingService } from './stream-processing.service';

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
    RedisProvider,
    LeaderboardDeltaRepository,
    LeaderboardRepository,
    StreamProcessingService,
    CacheService,
    LeaderboardSyncService,
  ],
  controllers: [LeaderboardController, StreamProcessingController],
})
export class LeaderboardModule {}
