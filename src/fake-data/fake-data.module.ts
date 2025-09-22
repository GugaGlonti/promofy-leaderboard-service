import { Module } from '@nestjs/common';
import { FakeDataService } from './fake-data.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { fakeDataConfig } from './fake-data.config';

@Module({
  imports: [
    ConfigModule.forFeature(fakeDataConfig),
    ClientsModule.registerAsync([
      {
        inject: [ConfigService],
        name: 'KAFKA_PRODUCER',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: configService
                .getOrThrow<string>('KAFKA_BROKERS')
                .split(','),
              clientId: configService.getOrThrow<string>(
                'FAKE_DATA_KAFKA_CLIENT_ID',
              ),
            },
            producerOnlyMode: true,
            producer: {
              allowAutoTopicCreation: configService.getOrThrow<boolean>(
                'FAKE_DATA_KAFKA_ALLOW_AUTO_TOPIC_CREATION',
              ),
            },
          },
        }),
      },
    ]),
  ],

  providers: [FakeDataService],
})
export class FakeDataModule {}
