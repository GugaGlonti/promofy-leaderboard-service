import { Injectable } from '@nestjs/common';
import { Readable } from 'node:stream';
import { GetLeaderboardOptions } from './dto/get-leaderboard-options.dto';
import { LeaderboardRepository } from './leaderboard.repository';
import { ApiResponseNoStatusOptions } from '@nestjs/swagger';

@Injectable()
export class CsvService {
  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  getReadableStream(id: string, options: GetLeaderboardOptions): Readable {
    let currentPage = 1;
    const pageSize = 100;
    let isHeaderWritten = false;

    const leaderboardRepository = this.leaderboardRepository;

    return new Readable({
      objectMode: false,

      async read() {
        try {
          const entries = await fetchLeaderboardPage(
            leaderboardRepository,
            id,
            options,
            currentPage,
            pageSize,
          );

          if (!entries.length) {
            this.push(null);
            return;
          }

          if (!isHeaderWritten) {
            this.push(generateCsvHeader(entries[0]));
            isHeaderWritten = true;
          }

          for (const entry of entries) {
            this.push(convertEntryToCsvRow(entry));
          }

          currentPage++;

          if (entries.length < pageSize) this.push(null);
        } catch (error) {
          this.destroy(error as Error);
        }
      },
    });
  }

  static openApi(): ApiResponseNoStatusOptions {
    return {
      description: 'Export leaderboard data as CSV',
      content: { 'text/csv': { schema: { type: 'string', format: 'binary' } } },
    };
  }
}

async function fetchLeaderboardPage(
  leaderboardRepository: LeaderboardRepository,
  id: string,
  options: GetLeaderboardOptions,
  page: number,
  pageSize: number,
) {
  return leaderboardRepository.getWithOptions(id, {
    ...options,
    page,
    pageSize,
  });
}

function generateCsvHeader(entry: Record<string, any>): string {
  return Object.keys(entry).join(',') + '\n';
}

function convertEntryToCsvRow(entry: Record<string, any>): string {
  return (
    Object.values(entry)
      .map((value) => escapeCsvValue(String(value)))
      .join(',') + '\n'
  );
}

function escapeCsvValue(value: string): string {
  return containsSpecialChars(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function containsSpecialChars(value: string): boolean {
  return value.includes(',') || value.includes('"') || value.includes('\n');
}
