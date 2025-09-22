import { ConfigService } from '@nestjs/config';
import { Module, Provider } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardRepository } from './leaderboard.repository';
import Redis from 'ioredis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardDelta } from '../common/entity/leaderboard-delta.entity';
import { LeaderboardCache } from './leaderboard-cache';
import { LeaderboardController } from './leaderboard.controller';
import { Leaderboard } from '../common/entity/leaderboard.entity';

export type RedisClient = Redis;

const RedisProvider: Provider<RedisClient> = {
  inject: [ConfigService],
  provide: 'REDIS_CLIENT',
  useFactory: (configService: ConfigService): RedisClient => {
    return new Redis({
      host: configService.getOrThrow<string>('REDIS_HOST'),
      port: configService.getOrThrow<number>('REDIS_PORT'),
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
