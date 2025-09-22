import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FakeDataModule } from './fake-data/fake-data.module';
import { StreamProcessingModule } from './stream-processing/stream-processing.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

const POSTGRES_PORT = 5432;
const POSTGRES_HOST = 'localhost';
const POSTGRES_USER = 'postgres';
const POSTGRES_PASSWORD = 'postgres';
const POSTGRES_DB = 'leaderboard';
const AUTOLOAD_ENTITIES = true;
const SYNCHRONIZE = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: POSTGRES_HOST,
      port: POSTGRES_PORT,
      username: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DB,
      autoLoadEntities: AUTOLOAD_ENTITIES,
      synchronize: SYNCHRONIZE,
      dropSchema: true,
    }),
    ScheduleModule.forRoot(),
    FakeDataModule,
    StreamProcessingModule,
    LeaderboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
