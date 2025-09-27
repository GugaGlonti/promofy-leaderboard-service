import { ApiResponseNoStatusOptions } from '@nestjs/swagger';
import { InternalServerErrorException } from '@nestjs/common';

export class LeaderboardNotFoundException extends InternalServerErrorException {
  constructor(id: string, source: string) {
    super(`Leaderboard or data for id "${id}" not found in ${source}`);
  }

  static openApi(): ApiResponseNoStatusOptions {
    return {
      description: 'Leaderboard not found',
      type: [LeaderboardNotFoundException],
      example: new LeaderboardNotFoundException('example-id', 'database'),
    };
  }
}
