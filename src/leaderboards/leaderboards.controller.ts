import { Controller } from '@nestjs/common';
import { Ctx, KafkaContext, Payload } from '@nestjs/microservices';
import { MessagePattern } from '@nestjs/microservices/decorators/message-pattern.decorator';
import { ScoreUpdateEvent } from '../common/event/score-update.event';
import { NewPlayerEvent } from '../common/event/new-player.event';

@Controller('leaderboards')
export class LeaderboardsController {
  @MessagePattern('score_update')
  updateScore(
    @Payload() value: ScoreUpdateEvent,
    @Ctx() context: KafkaContext,
  ): any {
    const key = context.getMessage().key;
    console.table({
      key,
      ...value,
    });
  }

  @MessagePattern('new_player')
  newPlayer(
    @Payload() value: NewPlayerEvent,
    @Ctx() context: KafkaContext,
  ): any {
    const key = context.getMessage().key;
    console.table({
      key,
      ...value,
    });
  }
}
