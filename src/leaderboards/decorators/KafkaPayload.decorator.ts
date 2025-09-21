import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { KafkaContext } from '@nestjs/microservices';
import { KafkaEvent } from '../../common/event/KafkaEvent';

const logger = new Logger('KafkaPayloadDecorator');

export const KafkaPayload = createParamDecorator<string | undefined>(
  (property: keyof KafkaEvent<any> | undefined, context: ExecutionContext) => {
    const message = context
      .switchToRpc()
      .getContext<KafkaContext>()
      .getMessage();

    if (!message.key) logger.warn('Message key is missing, defaulting to 0');

    const kafkaEvent = new KafkaEvent(
      message.key ? Number(message.key) : 0,
      message.value,
    );

    if (property) return kafkaEvent[property];
    return kafkaEvent;
  },
);
