import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { redisProvider } from './redis.provider';

@Module({
  providers: [RedisService, redisProvider],
})
export class RedisModule {}
