import { ResponseInterceptor } from './interceptor/Response.interceptor';
import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { PlayerScoreDto } from './dto/PlayerScore.dto';
import { PlayerPositionDto } from './dto/PlayerPosition.dto';
import { AllLeaderboardsDto } from './dto/AllLeaderboards.dto';
import { DateTimeLimit } from './enum/DateTimeLimit.enum';

@Controller('leaderboards')
@UseInterceptors(ResponseInterceptor)
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get(':id')
  async getLeaderboard(
    @Param('id') id: string,
    @Query('startDate') startDate = DateTimeLimit.MIN_DATE,
    @Query('endDate') endDate = DateTimeLimit.MAX_DATE,
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
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Query('contextSize') contextSize = 5,
  ): Promise<PlayerPositionDto> {
    return this.leaderboardService.getPlayerPosition(id, userId, contextSize);
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
