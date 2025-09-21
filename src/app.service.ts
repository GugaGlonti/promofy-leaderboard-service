import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  isHealthy(): boolean {
    /**
     * test stuff here ...
     */
    return true;
  }
}
