import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FakeDataModule } from './fake-data/fake-data.module';

@Module({
  imports: [FakeDataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
