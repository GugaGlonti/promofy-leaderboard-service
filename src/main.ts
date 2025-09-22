import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: config.getOrThrow<string>('KAFKA_CLIENT_ID'),
        brokers: config.getOrThrow<string>('KAFKA_BROKERS').split(','),
      },
      consumer: {
        groupId: config.getOrThrow<string>('KAFKA_CONSUMER_GROUP_ID'),
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(config.getOrThrow<number>('PORT'));
}

void bootstrap();
