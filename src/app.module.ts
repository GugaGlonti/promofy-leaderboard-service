import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FakeDataModule } from './fake-data/fake-data.module';
import { StreamProcessingModule } from './stream-processing/stream-processing.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [FakeDataModule, StreamProcessingModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
