import { NotFoundException } from '@nestjs/common';

export class PlayerRankNotFoundException extends NotFoundException {
  constructor(id: string, userId: string) {
    super(`Player with ID ${userId} not found in leaderboard ${id}`);
  }
}
