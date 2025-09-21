import {
  Controller,
  Get,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): { status: string } {
    if (this.appService.isHealthy()) {
      this.logger.log('Health check passed');
      return { status: 'ok' };
    }

    this.logger.warn('Health check failed');
    throw new HttpException(
      { status: 'unhealthy' },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
