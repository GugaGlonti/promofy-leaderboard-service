import { Module } from '@nestjs/common';
import { StreamProcessingService } from './stream-processing.service';
import { StreamProcessingController } from './stream-processing.controller';

@Module({
  providers: [StreamProcessingService],
  controllers: [StreamProcessingController],
})
export class StreamProcessingModule {}
