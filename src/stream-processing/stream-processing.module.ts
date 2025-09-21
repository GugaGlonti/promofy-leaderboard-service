import { Module } from '@nestjs/common';
import { StreamProcessingController } from './stream-processing.controller';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { StreamProcessingService } from './stream-processing.service';

@Module({
  controllers: [StreamProcessingController],
  imports: [LeaderboardModule],
  providers: [StreamProcessingService],
})
export class StreamProcessingModule {}
