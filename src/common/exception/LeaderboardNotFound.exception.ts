import { NotFoundException } from '@nestjs/common';

export class LeaderboardNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Leaderboard or data for id "${id}" not found in cache or database`);
  }
}
