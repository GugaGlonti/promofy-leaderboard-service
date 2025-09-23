import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaEvent } from '../common/event/KafkaEvent';
import { NewPlayerEvent } from '../common/event/new-player.event';
import { ScoreUpdateEvent } from '../common/event/score-update.event';
import type { FakeDataConfig } from './fake-data.config';
import { fakeDataConfig } from './fake-data.config';

type FakeUser = { ID: number; score: number };

@Injectable()
export class FakeDataService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FakeDataService.name);
  private readonly workers: Array<NodeJS.Timeout> = [];

  private playerCounter = 1;
  private readonly initialUser: FakeUser = { ID: 0, score: 0 };
  private readonly playerSet: Set<FakeUser> = new Set([this.initialUser]);
  private readonly playerArray: FakeUser[] = [this.initialUser];

  constructor(
    @Inject('KAFKA_PRODUCER')
    private readonly kafkaProducer: ClientKafka,

    @Inject(fakeDataConfig.KEY)
    private readonly config: FakeDataConfig,
  ) {}

  async onModuleInit() {
    this.logger.log('Connecting to Kafka...');
    await this.kafkaProducer.connect();

    this.logger.log('Starting to generate fake data...');
    this.run();
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down workers...');
    this.workers.forEach((worker) => clearInterval(worker));
    await this.kafkaProducer.close();
  }

  private run() {
    this.logger.log(
      `Starting ${this.config.concurrentWorkers} workers to generate fake data...`,
    );
    for (let i = 0; i < this.config.concurrentWorkers; i++) this.startWorker(i);
  }

  private startWorker(id: number) {
    this.logger.log(`Worker ${id} started`);
    const worker = setInterval(() => {
      if (Math.random() < this.config.scoreUpdateProbability) {
        this.sendFakeScore();
      }
      if (Math.random() < this.config.newPlayerProbability) {
        this.sendFakeNewPlayer();
      }
    }, this.config.sendEventInterval);
    this.workers.push(worker);
  }

  private sendFakeScore() {
    try {
      const user =
        this.playerArray[Math.floor(Math.random() * this.playerArray.length)];

      const scoreDelta =
        Math.floor((Math.random() * 2 - 0.5) * this.config.scoreVariance) || 1;

      const scoreUpdateEvent = new ScoreUpdateEvent(
        user.ID,
        scoreDelta,
        new Date(),
      );
      const event = new KafkaEvent(user.ID, scoreUpdateEvent);

      this.kafkaProducer.emit('score_update', event);
      this.logger.debug(`Sent score update for ${user.ID}: +${scoreDelta}`);
    } catch (error) {
      this.logger.error('Error sending score update:', error);
    }
  }

  private sendFakeNewPlayer() {
    try {
      this.playerCounter++;
      const user = {
        ID: this.playerCounter,
        username: `player_${this.playerCounter}`,
        score: 0,
      };

      if (this.playerSet.has(user)) {
        this.logger.warn(`Player ${user.username} already exists, skipping`);
        return;
      } else {
        this.playerSet.add(user);
        this.playerArray.push(user);
      }

      const score = Math.floor(Math.random() * this.config.scoreVariance) + 1;
      const newPlayerEvent = new NewPlayerEvent(user.ID, score, new Date());
      const event = new KafkaEvent(user.ID, newPlayerEvent);

      this.kafkaProducer.emit('new_player', event);
      this.logger.debug(
        `Sent new player: ${user.ID} with initial score ${score}`,
      );
    } catch (error) {
      this.logger.error('Error sending new player:', error);
    }
  }
}
