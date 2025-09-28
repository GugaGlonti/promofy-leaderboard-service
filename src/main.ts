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
        enableAutoCommit: false,
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

  await app.startAllMicroservices().catch(() => {
    console.error('Error starting microservices');
    process.exit(1);
  });
  await app.listen(config.getOrThrow<number>('PORT')).catch(() => {
    console.error('Error starting main application');
    process.exit(1);
  });

  const PORT = config.getOrThrow<number>('PORT');
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Environment: ${config.getOrThrow<string>('NODE_ENV')}`);
  console.log(`Application running on: http://localhost:${PORT}/`);
  console.log(`Swagger docs available at: http://localhost:${PORT}/api`);
  console.log(`OpenApi spec available at: http://localhost:${PORT}/api-json`);
}

void bootstrap();
