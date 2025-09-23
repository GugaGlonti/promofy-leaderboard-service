import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { DateTimeLimit } from '../enum/DateTimeLimit.enum';

export class GetLeaderboardOptions {
  @IsOptional()
  @IsString()
  startDate: string = DateTimeLimit.MIN_DATE;

  @IsOptional()
  @IsString()
  endDate: string = DateTimeLimit.MAX_DATE;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 50;
}
