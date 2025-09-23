import { ResponseInterceptor } from './interceptor/Response.interceptor';
import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { PlayerScoreDto } from './dto/PlayerScore.dto';
import { PlayerPositionDto } from './dto/PlayerPosition.dto';
import { AllLeaderboardsDto } from './dto/AllLeaderboards.dto';
import { GetLeaderboardOptions } from './dto/GetLeaderboardOptions.dto';

@Controller('leaderboards')
@UseInterceptors(ResponseInterceptor)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get(':id')
  async getLeaderboard(
    @Param('id') id: string,
    @Query() options: GetLeaderboardOptions,
  ): Promise<PlayerScoreDto[]> {
    const { startDate, endDate, limit, page, pageSize } = options;
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
