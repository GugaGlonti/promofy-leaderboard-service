import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  SwaggerModule.setup(
    'api',
    app,
    () =>
      SwaggerModule.createDocument(
        app,
        new DocumentBuilder()
          .setTitle('Promofy Leaderboard Service API')
          .setDescription('Promofy Leaderboard Service API Documentation')
          .setVersion('0.0.1')
          .addTag('promofy-leaderboard')
          .build(),
      ),
    { jsonDocumentUrl: 'api-json' },
  );

  await app.startAllMicroservices();
  await app.listen(config.getOrThrow<number>('PORT'));
}

void bootstrap();
