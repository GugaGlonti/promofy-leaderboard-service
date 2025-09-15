import { Module } from '@nestjs/common';
import { LeaderboardsService } from './leaderboards.service';
import { LeaderboardsController } from './leaderboards.controller';

@Module({
  providers: [LeaderboardsService],
  controllers: [LeaderboardsController],
})
export class LeaderboardsModule {}
