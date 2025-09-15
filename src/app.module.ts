import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FakeDataModule } from './fake-data/fake-data.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';

@Module({
  imports: [FakeDataModule, LeaderboardsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
