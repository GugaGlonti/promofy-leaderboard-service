import { KafkaMessage } from './../../../node_modules/@nestjs/microservices/external/kafka.interface.d';
import { Consumer } from 'kafkajs';

export class KafkaEvent<T> {
  constructor(
    public readonly key: number,
    public readonly value: T,
    public readonly partition: number,
    public readonly topic: string,
    public readonly consumer: Consumer,
    public readonly message: KafkaMessage,
  ) {}
}
