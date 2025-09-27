import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetLeaderboardOptions } from './dto/get-leaderboard-options.dto';
import { LeaderboardEntry } from './dto/leaderboard-entry.dto';
import { Leaderboard } from './entity/leaderboard.entity';
import { DateTimeLimit } from './enum/date-time-limit.enum';

@Injectable()
export class LeaderboardRepository {
  private readonly logger = new Logger(LeaderboardRepository.name);

  constructor(
    @InjectRepository(Leaderboard)
    private readonly leaderboard: Repository<Leaderboard>,
  ) {}

  async findAll(): Promise<Leaderboard[]> {
    this.logger.debug('Fetching all leaderboards from the database');
    return this.leaderboard.find();
  }

  async insertOrIgnore(leaderboards: Partial<Leaderboard>[]) {
    this.logger.debug('Creating default leaderboards if not exist');
    await this.leaderboard
      .createQueryBuilder()
      .insert()
      .values(leaderboards)
      .orIgnore()
      .execute();
  }

  async aggregate(id: string): Promise<LeaderboardEntry[]>;
  async aggregate(
    id: string,
    options: GetLeaderboardOptions,
  ): Promise<LeaderboardEntry[]>;
  async aggregate(
    id: string,
    options?: GetLeaderboardOptions,
  ): Promise<LeaderboardEntry[]> {
    this.logger.debug(
      `Fetching leaderboard for id: ${id}` + (options ? ' with options' : ''),
    );

    const params: any[] = [id];
    let dateFilter = '';
    let limitOffset = '';

    if (options) {
      const { startDate, endDate, limit, page, pageSize } = options;
      const offset = (page - 1) * pageSize;
      if (limit > 0 && offset >= limit) return [];
      const take = limit > 0 ? Math.min(pageSize, limit - offset) : pageSize;

    const minDate = DateTimeLimit.MIN_DATE?.toString();
    const maxDate = DateTimeLimit.MAX_DATE?.toString();
    if (startDate !== minDate || endDate !== maxDate) {
      params.push(startDate, endDate);
      dateFilter = `AND d."CREATED_AT" BETWEEN $2 AND $3`;
    }

    params.push(take, offset);
      limitOffset = `LIMIT $${params.length - 1} OFFSET $${params.length}`;
    }

    const sql = `
      SELECT
          d."PLAYER_ID" AS "userId",
          SUM(d."SCORE_DELTA") AS "score"
      
      FROM "LEADERBOARDS" l
    INNER JOIN
    "LEADERBOARD_DELTA_MAPPING" ldm ON ldm."LEADERBOARD_ID" = l."ID"
    INNER JOIN
    "LEADERBOARD_DELTAS" d ON d."ID" = ldm."DELTA_ID"
      
      WHERE l."ID" = $1
        ${dateFilter}

      GROUP BY d."PLAYER_ID"
      ORDER BY "score" DESC
    ${limitOffset}
    `;

    return this.leaderboard.query<LeaderboardEntry[]>(sql, params);
  }
}
