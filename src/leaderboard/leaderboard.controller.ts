import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { CsvService } from './csv.service';
import { GetLeaderboardOptions } from './dto/get-leaderboard-options.dto';
import { GetLeaderboardResponse } from './dto/get-leaderboard-response.dto';
import { GetPlayerRankOptions } from './dto/get-player-rank-options.dto';
import { LeaderboardStatusDto } from './dto/leaderboard-status.dto';
import { PlayerRankDto } from './dto/player-rank.dto';
import { LeaderboardNotFoundException } from './exception/leaderboard-not-found.exception';
import { PlayerRankNotFoundException } from './exception/player-rank-not-found.exception';
import { ResponseHeaderInterceptor } from './interceptor/response-header.interceptor';
import { LeaderboardService } from './leaderboard.service';

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
    const entries = await this.leaderboardService.getEntries(id, options);
    return new GetLeaderboardResponse(entries, entries.length);
  }

  @Get(':id/players/:userId')
  @ApiOkResponse(PlayerRankDto.openApi())
  @ApiNotFoundResponse(PlayerRankNotFoundException.openApi())
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
  @ApiOkResponse(CsvService.openApi())
  @ApiNotFoundResponse(LeaderboardNotFoundException.openApi())
  @Header('Content-Disposition', `attachment; filename="leaderboard.csv"`)
  @Header('Content-Type', 'text/csv')
  @Header('Transfer-Encoding', 'chunked')
  exportLeaderboard(
    @Param('id') id: string,
    @Query() options: GetLeaderboardOptions,
    @Res() res: Response,
  ) {
    this.leaderboardService.getReadable(id, options).pipe(res);
  }

  @Get()
  @ApiOkResponse(LeaderboardStatusDto.openApi())
  getAllLeaderboards(): LeaderboardStatusDto {
    return this.leaderboardService.getStatus();
  }
}
