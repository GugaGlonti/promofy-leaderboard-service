import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetPlayerRankOptions {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({
    description: 'Number of surrounding players to include in the response',
    example: 5,
    default: 5,
    type: Number,
  })
  contextRadius: number = 5;
}
