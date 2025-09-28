import { ServiceUnavailableException } from '@nestjs/common';

export class KafkaCommitException extends ServiceUnavailableException {
  constructor(offset: string) {
    super(`Failed to commit Kafka offset ${offset}`);
  }
}
