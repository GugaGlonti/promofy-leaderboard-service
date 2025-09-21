import { Module } from '@nestjs/common';
import { StreamProcessingController } from './stream-processing.controller';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  controllers: [StreamProcessingController],
  imports: [LeaderboardModule],
})
export class StreamProcessingModule {}
