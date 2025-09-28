import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.development.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (env: ConfigService) => ({
        type: 'postgres',
        host: env.getOrThrow<string>('POSTGRES_HOST'),
        port: Number(env.getOrThrow<string>('POSTGRES_PORT')),
        username: env.getOrThrow<string>('POSTGRES_USER'),
        password: env.getOrThrow<string>('POSTGRES_PASSWORD'),
        database: env.getOrThrow<string>('POSTGRES_DB'),
        autoLoadEntities: env.getOrThrow<boolean>('AUTOLOAD_ENTITIES'),
        synchronize: env.getOrThrow<boolean>('SYNCHRONIZE'),
        dropSchema: env.getOrThrow<boolean>('DROP_SCHEMA'),
        retryAttempts: 10,
        retryDelay: 3000,
        logging: env.get<boolean>('TYPEORM_LOGGING', false),
        logger: 'advanced-console',
      }),
    }),
    ScheduleModule.forRoot(),
    LeaderboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
