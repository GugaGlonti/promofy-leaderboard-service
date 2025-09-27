import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { GetLeaderboardOptions } from './dto/get-leaderboard-options.dto';
import { GetLeaderboardResponse } from './dto/get-leaderboard-response.dto';
import { LeaderboardStatusDto } from './dto/leaderboard-status.dto';
import { PlayerRankDto } from './dto/player-rank.dto';
import { LeaderboardNotFoundException } from './exception/leaderboard-not-found.exception';
import { ResponseHeaderInterceptor } from './interceptor/response-header.interceptor';
import { LeaderboardService } from './leaderboard.service';
import { GetPlayerRankOptions } from './dto/get-player-rank-options.dto';

@Controller('leaderboards')
@UseInterceptors(ResponseHeaderInterceptor)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get(':id')
  @ApiOkResponse(GetLeaderboardResponse.openApi())
  @ApiNotFoundResponse(LeaderboardNotFoundException.openApi())
  async getLeaderboard(
    @Param('id') id: string,
    @Query() options: GetLeaderboardOptions,
  ): Promise<GetLeaderboardResponse> {
    const entries = await this.leaderboardService.getLeaderboard(id, options);
    return new GetLeaderboardResponse(entries, entries.length);
  }

  @Get(':id/players/:userId')
  @ApiOkResponse(PlayerRankDto.openApi())
  @ApiNotFoundResponse(LeaderboardNotFoundException.openApi())
  async getPlayerRank(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Query() options: GetPlayerRankOptions,
  ): Promise<PlayerRankDto> {
    const { contextRadius } = options;
    return this.leaderboardService.getPlayerPosition(id, userId, contextRadius);
  }

  @Get(':id/export')
  @ApiOkResponse({
    description: 'Export leaderboard data (WIP)',
    type: String,
  })
  @ApiNotFoundResponse(LeaderboardNotFoundException.openApi())
  exportLeaderboard(@Param('id') id: string) {
    return { message: `Exporting leaderboard data for id ${id}` };
  }

  @Get()
  @ApiOkResponse(LeaderboardStatusDto.openApi())
  getAllLeaderboards(): LeaderboardStatusDto {
    return this.leaderboardService.getAllLeaderboards();
  }
}
