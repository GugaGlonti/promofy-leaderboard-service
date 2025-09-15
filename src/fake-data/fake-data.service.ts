import {
  Injectable,
  Inject,
  OnModuleInit,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ScoreUpdateEvent } from '../common/event/score-update.event';
import { NewPlayerEvent } from '../common/event/new-player.event';
import { KafkaEvent } from '../common/event/KafkaEvent';

const WORKERS = 5;

const SCORE_VARIANCE = 100;
const SCORE_UPDATE_PROBABILITY = 0.7;
const SCORE_NEW_PLAYER_PROBABILITY = 0.1;
const SEND_INTERVAL = 500;

@Injectable()
export class FakeDataService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FakeDataService.name);
  private readonly workers: Array<NodeJS.Timeout> = [];

  private readonly playerSet: Set<string> = new Set(['player_1']);
  private readonly playerArray: string[] = Array.from(this.playerSet);
  private playerCounter = 1;

  constructor(
    @Inject('KAFKA_PRODUCER')
    private readonly kafkaProducer: ClientKafka,
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
    this.logger.log(`Starting ${WORKERS} workers to generate fake data...`);
    for (let i = 0; i < WORKERS; i++) this.startWorker(i);
  }

  private startWorker(id: number) {
    this.logger.log(`Worker ${id} started`);
    const worker = setInterval(() => {
      if (Math.random() < SCORE_UPDATE_PROBABILITY) {
        this.sendFakeScore(id);
      }
      if (Math.random() < SCORE_NEW_PLAYER_PROBABILITY) {
        this.sendFakeNewPlayer(id);
      }
    }, SEND_INTERVAL);
    this.workers.push(worker);
  }

  private sendFakeScore(workerId: number) {
    try {
      const userId =
        this.playerArray[Math.floor(Math.random() * this.playerArray.length)];
      const scoreDelta = Math.floor(Math.random() * SCORE_VARIANCE) + 1;
      const scoreUpdateEvent = new ScoreUpdateEvent(
        userId,
        scoreDelta,
        new Date(),
      );

      const topic = 'score_update';
      const event = new KafkaEvent(workerId.toString(), scoreUpdateEvent);

      this.kafkaProducer.emit(topic, event);
      this.logger.debug(`Sent score update for ${userId}: +${scoreDelta}`);
    } catch (error) {
      this.logger.error('Error sending score update:', error);
    }
  }

  private sendFakeNewPlayer(workerId: number) {
    try {
      this.playerCounter++;
      const userId = `player_${this.playerCounter}`;

      if (this.playerSet.has(userId)) {
        this.logger.warn(`Player ${userId} already exists, skipping`);
        return;
      } else {
        this.playerSet.add(userId);
        this.playerArray.push(userId);
      }

      const score = Math.floor(Math.random() * SCORE_VARIANCE) + 1;
      const newPlayerEvent = new NewPlayerEvent(userId, score, new Date());

      const topic = 'new_player';
      const event = new KafkaEvent(workerId.toString(), newPlayerEvent);

      this.kafkaProducer.emit(topic, event);
      this.logger.debug(
        `Sent new player: ${userId} with initial score ${score}`,
      );
    } catch (error) {
      this.logger.error('Error sending new player:', error);
    }
  }
}
