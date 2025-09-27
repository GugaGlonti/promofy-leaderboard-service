import { ConfigType, registerAs } from '@nestjs/config';

export const fakeDataConfig = registerAs('fakeData', () => ({
  concurrentWorkers: Number(process.env.FAKE_DATA_CONCURRENT_WORKERS ?? 1),

  sendEventInterval: Number(process.env.FAKE_DATA_SEND_EVENT_INTERVAL ?? 1000),

  scoreVariance: Number(process.env.FAKE_DATA_SCORE_VARIANCE ?? 100),

  scoreUpdateProbability: Number(
    process.env.FAKE_DATA_SCORE_UPDATE_PROBABILITY ?? 0.7,
  ),

  newPlayerProbability: Number(
    process.env.FAKE_DATA_SCORE_NEW_PLAYER_PROBABILITY ?? 0.1,
  ),

  initialPlayerScore: Number(
    process.env.FAKE_DATA_INITIAL_PLAYER_SCORE ?? 1000,
  ),
}));

export type FakeDataConfig = ConfigType<typeof fakeDataConfig>;
