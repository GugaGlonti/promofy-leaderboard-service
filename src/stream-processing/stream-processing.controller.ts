import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices/decorators/message-pattern.decorator';
import { ScoreUpdateEvent } from '../common/event/score-update.event';
import { NewPlayerEvent } from '../common/event/new-player.event';
import { KafkaPayload } from './decorators/KafkaPayload.decorator';
import { KafkaEvent } from '../common/event/KafkaEvent';
import { LeaderboardService } from '../leaderboard/leaderboard.service';

@Controller('stream-processing')
export class StreamProcessingController {
  private readonly logger = new Logger(StreamProcessingController.name);

  constructor(private readonly leaderboardService: LeaderboardService) {}

  @MessagePattern('new_player')
  newPlayer(@KafkaPayload() { key, value }: KafkaEvent<NewPlayerEvent>): any {
    this.logger.debug(
      `Received new_player KEY: ${key} Value: ${JSON.stringify(value)}`,
    );
    return this.leaderboardService.initializePlayer();
  }

  @MessagePattern('score_update')
  updateScore(
    @KafkaPayload() { key, value }: KafkaEvent<ScoreUpdateEvent>,
  ): any {
    this.logger.debug(
      `Received score_update KEY: ${key} Value: ${JSON.stringify(value)}`,
    );
    return this.leaderboardService.updateScore();
  }
}
