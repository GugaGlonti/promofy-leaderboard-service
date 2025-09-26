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

  async get(id: string): Promise<LeaderboardEntry[]> {
    this.logger.debug(`Fetching leaderboard for id: ${id}`);

    const sql = `
      SELECT
          d."PLAYER_ID" AS "playerId",
          SUM(d."SCORE_DELTA") AS "totalScore"
      
      FROM "LEADERBOARDS" l
      INNER JOIN "LEADERBOARD_DELTA_MAPPING" ldm
          ON ldm."LEADERBOARD_ID" = l."ID"
      INNER JOIN "LEADERBOARD_DELTAS" d
          ON d."ID" = ldm."DELTA_ID"

      WHERE l."ID" = $1
      GROUP BY d."PLAYER_ID"
      ORDER BY "totalScore" DESC
    `;

    return this.leaderboard.query(sql, [id]);
  }

  async getWithOptions(
    id: string,
    { startDate, endDate, limit, page, pageSize }: GetLeaderboardOptions,
  ): Promise<LeaderboardEntry[]> {
    this.logger.debug(`Fetching leaderboard for id: ${id} with options`);

    const offset = (page - 1) * pageSize;
    if (limit > 0 && offset >= limit) return [];
    const take = limit > 0 ? Math.min(pageSize, limit - offset) : pageSize;

    const params: any[] = [id];
    let dateFilter = '';

    const minDate = DateTimeLimit.MIN_DATE?.toString();
    const maxDate = DateTimeLimit.MAX_DATE?.toString();
    if (startDate !== minDate || endDate !== maxDate) {
      params.push(startDate, endDate);
      dateFilter = `AND d."CREATED_AT" BETWEEN $2 AND $3`;
    }

    params.push(take, offset);

    const sql = `
      SELECT
          d."PLAYER_ID" AS "playerId",
          SUM(d."SCORE_DELTA") AS "totalScore"
      
      FROM "LEADERBOARDS" l
      INNER JOIN "LEADERBOARD_DELTA_MAPPING" ldm
          ON ldm."LEADERBOARD_ID" = l."ID"
      INNER JOIN "LEADERBOARD_DELTAS" d
          ON d."ID" = ldm."DELTA_ID"
      
      WHERE l."ID" = $1
        ${dateFilter}
      GROUP BY d."PLAYER_ID"
      ORDER BY "totalScore" DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    return this.leaderboard.query(sql, params);
  }
}
