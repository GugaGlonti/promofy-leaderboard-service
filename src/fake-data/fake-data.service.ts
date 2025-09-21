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
import { FakeUser } from './dto/FakeUser.type';

const WORKERS = 5;

const SCORE_VARIANCE = 100;
const SCORE_UPDATE_PROBABILITY = 0.7;
const SCORE_NEW_PLAYER_PROBABILITY = 0.1;
const SEND_INTERVAL = 500;

const NEW_PLAYER_TOPIC = 'new_player';
const SCORE_UPDATE_TOPIC = 'score_update';

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
        this.sendFakeScore();
      }
      if (Math.random() < SCORE_NEW_PLAYER_PROBABILITY) {
        this.sendFakeNewPlayer();
      }
    }, SEND_INTERVAL);
    this.workers.push(worker);
  }

  private sendFakeScore() {
    try {
      const user =
        this.playerArray[Math.floor(Math.random() * this.playerArray.length)];
      const scoreDelta = Math.floor(Math.random() * SCORE_VARIANCE) + 1;
      const scoreUpdateEvent = new ScoreUpdateEvent(
        user.ID,
        scoreDelta,
        new Date(),
      );
      const event = new KafkaEvent(user.ID, scoreUpdateEvent);

      this.kafkaProducer.emit(SCORE_UPDATE_TOPIC, event);
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

      const score = Math.floor(Math.random() * SCORE_VARIANCE) + 1;
      const newPlayerEvent = new NewPlayerEvent(user.ID, score, new Date());
      const event = new KafkaEvent(user.ID, newPlayerEvent);

      this.kafkaProducer.emit(NEW_PLAYER_TOPIC, event);
      this.logger.debug(
        `Sent new player: ${user.ID} with initial score ${score}`,
      );
    } catch (error) {
      this.logger.error('Error sending new player:', error);
    }
  }
}
