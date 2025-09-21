import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

const REDIS_HOST = 'localhost';
const REDIS_PORT = 6379;

export type RedisClient = Redis;

export const redisProvider: Provider = {
  useFactory: (): RedisClient => {
    return new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
    });
  },
  provide: 'REDIS_CLIENT',
};
