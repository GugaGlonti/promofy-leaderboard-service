import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ScoreUpdateEvent } from './event/score-update.event';
import { NewPlayerEvent } from './event/new-player.event';
import { KafkaPayload } from './decorators/KafkaPayload.decorator';
import { KafkaEvent } from './event/kafka-event';
import { StreamProcessingService } from './stream-processing.service';
import { Consumer } from '@nestjs/microservices/external/kafka.interface';
import { KafkaCommitException } from './exception/kafka-commit.exception';

@Controller('stream-processing')
export class StreamProcessingController {
  private readonly logger = new Logger(StreamProcessingController.name);

  constructor(
    private readonly streamProcessingService: StreamProcessingService,
  ) {}

  @MessagePattern('new_player')
  async newPlayer(
    @KafkaPayload()
    {
      key,
      value,
      partition,
      topic,
      consumer,
      message,
    }: KafkaEvent<NewPlayerEvent>,
  ): Promise<any> {
    this.logger.debug(`Received new_player KEY: ${key}`);
    await this.streamProcessingService.initializePlayer(value);
    await this.commitOffsets(consumer, topic, partition, message.offset);
  }

  @MessagePattern('score_update')
  async updateScore(
    @KafkaPayload()
    {
      key,
      value,
      partition,
      topic,
      consumer,
      message,
    }: KafkaEvent<ScoreUpdateEvent>,
  ): Promise<any> {
    this.logger.debug(`Received score_update KEY: ${key}`);
    await this.streamProcessingService.updateScore(value);
    await this.commitOffsets(consumer, topic, partition, message.offset);
  }

  private async commitOffsets(
    consumer: Consumer,
    topic: string,
    partition: number,
    offset: string,
  ) {
    const nextOffset = (Number(offset) + 1).toString();
    try {
      await consumer.commitOffsets([{ topic, partition, offset: nextOffset }]);
      const msg = `Committed offset ${nextOffset} for topic ${topic} partition ${partition}`;
      this.logger.debug(msg);
    } catch {
      throw new KafkaCommitException(nextOffset);
    }
  }
}
