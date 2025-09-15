import { Module } from '@nestjs/common';
import { FakeDataService } from './fake-data.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['localhost:9092'],
            clientId: 'fake-data-producer',
          },
          producerOnlyMode: true,
          producer: {
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],

  providers: [FakeDataService],
})
export class FakeDataModule {}
