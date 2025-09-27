import { NotFoundException } from '@nestjs/common';

export class PlayerRankNotFoundException extends NotFoundException {
  constructor(id: string, userId: string) {
    super(`Player with ID ${userId} not found in leaderboard ${id}`);
  }

  static openApi() {
    return {
      description: 'Player not found in the specified leaderboard',
      schema: {
        example: {
          message: 'Player with ID 123 not found in leaderboard 456',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    };
  }
}
