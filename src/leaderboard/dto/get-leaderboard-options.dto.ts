import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { DateTimeLimit } from '../enum/date-time-limit.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetLeaderboardOptions {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description:
      'Start date for filtering leaderboard entries (ISO 8601 format)',
    example: '2023-01-01T00:00:00Z',
    default: DateTimeLimit.MIN_DATE,
    type: String,
  })
  startDate?: string = DateTimeLimit.MIN_DATE;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'End date for filtering leaderboard entries (ISO 8601 format)',
    example: '2026-12-31T23:59:59Z',
    default: DateTimeLimit.MAX_DATE,
    type: String,
  })
  endDate?: string = DateTimeLimit.MAX_DATE;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Limit the number of leaderboard entries returned',
    example: 50,
    default: 50,
    type: Number,
  })
  limit: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Page number for paginated results',
    example: 1,
    default: 1,
    type: Number,
  })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Number of entries per page for pagination',
    example: 50,
    default: 50,
    type: Number,
  })
  pageSize: number = 50;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Flag to skip Redis caching (for debugging purposes)',
    example: false,
    default: false,
    type: Boolean,
  })
  skipRedis?: boolean = false;
}
