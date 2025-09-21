import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { KafkaContext } from '@nestjs/microservices';
import { KafkaEvent } from '../../common/event/KafkaEvent';

const logger = new Logger('KafkaPayloadDecorator');

export const KafkaPayload = createParamDecorator<string | undefined>(
  (property: keyof KafkaEvent<any> | undefined, context: ExecutionContext) => {
    const { key, value } = context
      .switchToRpc()
      .getContext<KafkaContext>()
      .getMessage();

    if (!key) logger.warn('Message key is missing, defaulting to 0');
    const kafkaEvent = new KafkaEvent(key ? Number(key) : 0, value);

    if (property) return kafkaEvent[property];
    return kafkaEvent;
  },
);
