import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices/decorators/message-pattern.decorator';
import { ScoreUpdateEvent } from '../common/event/score-update.event';
import { NewPlayerEvent } from '../common/event/new-player.event';
import { KafkaPayload } from './decorators/KafkaPayload.decorator';
import { KafkaEvent } from '../common/event/KafkaEvent';

@Controller('leaderboards')
export class LeaderboardsController {
  private readonly logger = new Logger(LeaderboardsController.name);

  @MessagePattern('score_update')
  updateScore(
    @KafkaPayload() { key, value }: KafkaEvent<ScoreUpdateEvent>,
  ): any {
    this.logger.debug(
      `Received score_update KEY: ${key} Value: ${JSON.stringify(value)}`,
    );
  }

  @MessagePattern('new_player')
  newPlayer(@KafkaPayload() { key, value }: KafkaEvent<NewPlayerEvent>): any {
    this.logger.debug(
      `Received new_player KEY: ${key} Value: ${JSON.stringify(value)}`,
    );
  }
}
