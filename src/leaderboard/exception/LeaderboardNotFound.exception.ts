import { InternalServerErrorException } from '@nestjs/common';

export class LeaderboardNotFoundException extends InternalServerErrorException {
  constructor(id: string, source: string) {
    super(`Leaderboard or data for id "${id}" not found in ${source}`);
  }
}
