import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GetLeaderboardOptions } from './dto/get-leaderboard-options.dto';
import { LeaderboardEntry } from './dto/leaderboard-entry.dto';
import { LeaderboardStatusDto } from './dto/leaderboard-status.dto';
import { PlayerRankDto } from './dto/player-rank.dto';
import { ResponseInterceptor } from './interceptor/Response.interceptor';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboards')
@UseInterceptors(ResponseInterceptor)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get(':id')
  async getLeaderboard(
    @Param('id') id: string,
    @Query() options: GetLeaderboardOptions,
  ): Promise<LeaderboardEntry[]> {
    return this.leaderboardService.getLeaderboard(id, options);
  }

  @Get(':id/players/:userId')
  getPlayerRank(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Query('contextRadius') contextRadius = 5,
  ): Promise<PlayerRankDto> {
    return this.leaderboardService.getPlayerPosition(id, userId, contextRadius);
  }

  @Get(':id/export')
  exportLeaderboard(@Param('id') id: string) {
    return { message: `Exporting leaderboard data for id ${id}` };
  }

  @Get()
  getAllLeaderboards(): LeaderboardStatusDto {
    return this.leaderboardService.getAllLeaderboards();
  }
}
