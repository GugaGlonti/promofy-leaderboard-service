import { Controller, Get, Param, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { PlayerScoreDto } from '../common/dto/PlayerScore.dto';
import { PlayerPositionDto } from '../common/dto/PlayerPosition.dto';
import { AllLeaderboardsDto } from '../common/dto/AllLeaderboards.dto';

@Controller('leaderboards')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get(':id')
  async getLeaderboard(
    @Param('id') id: string = 'global',
    @Query('startDate') startDate = '1970-01-01T00:00:00',
    @Query('endDate') endDate = '9999-12-31T23:59:59',
    @Query('limit') limit = 50,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 50,
  ): Promise<PlayerScoreDto[]> {
    return this.leaderboardService.getLeaderboard(
      id,
      startDate,
      endDate,
      limit,
      page,
      pageSize,
    );
  }

  @Get(':id/players/:userId')
  getPlayerRank(
    //@Param('id') id: string,
    @Param('userId') userId: string,
    @Query('contextSize') contextSize = 5,
  ): Promise<PlayerPositionDto> {
    return this.leaderboardService.getPlayerPosition(userId, contextSize);
  }

  @Get(':id/export')
  exportLeaderboard(@Param('id') id: string) {
    return { message: `Exporting leaderboard data for id ${id}` };
  }

  @Get()
  async getAllLeaderboards(): Promise<AllLeaderboardsDto> {
    return this.leaderboardService.getAllLeaderboards();
  }
}
