import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { KafkaContext } from '@nestjs/microservices';
import { KafkaEvent } from '../event/kafka-event';

const logger = new Logger('KafkaPayloadDecorator');

export const KafkaPayload = createParamDecorator<string | undefined>(
  (property: keyof KafkaEvent<any> | undefined, context: ExecutionContext) => {
    const kafkaContext = context.switchToRpc().getContext<KafkaContext>();

    const consumer = kafkaContext.getConsumer();
    const message = kafkaContext.getMessage();

    const key = message.key ? Number(message.key) : 0;
    const value = message.value;
    const partition = kafkaContext.getPartition();
    const topic = kafkaContext.getTopic();

    if (!key) logger.warn('Message key is missing, defaulting to 0');
    const kafkaEvent = new KafkaEvent(
      key,
      value,
      partition,
      topic,
      consumer,
      message,
    );

    if (property) return kafkaEvent[property];
    return kafkaEvent;
  },
);
