import { Inject, Injectable, Logger } from '@nestjs/common';
import type { RedisClient } from './redis.provider';

@Injectable()
export class RedisService {
  private readonly Logger = new Logger(RedisService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClient,
  ) {}

  getClient(): RedisClient {
    return this.redisClient;
  }
}
