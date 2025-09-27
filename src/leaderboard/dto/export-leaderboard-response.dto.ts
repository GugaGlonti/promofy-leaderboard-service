import { ApiProperty, ApiResponseNoStatusOptions } from '@nestjs/swagger';

export class ExportLeaderboardResponseDto {
  @ApiProperty({
    description: 'The CSV content as a string',
    example:
      '# Leaderboard Export: game-123\n# Exported at: 2024-01-15T10:30:00.000Z\nrank,userId,score,username\n1,user123,1500,PlayerOne\n2,user456,1200,PlayerTwo',
  })
  content: string;

  @ApiProperty({
    description: 'MIME type of the exported content',
    example: 'text/csv',
  })
  contentType: string;

  @ApiProperty({
    description: 'Suggested filename for the export',
    example: 'leaderboard-game-123-2024-01-15T10-30-00-000Z.csv',
  })
  filename: string;

  @ApiProperty({
    description: 'Size of the content in bytes',
    example: 245,
  })
  size: number;

  @ApiProperty({
    description: 'Leaderboard ID that was exported',
    example: 'game-123',
  })
  leaderboardId: string;

  @ApiProperty({
    description: 'Timestamp when the export was generated',
    example: '2024-01-15T10:30:00.000Z',
  })
  exportedAt: string;

  @ApiProperty({
    description: 'Number of entries included in the export',
    example: 150,
  })
  entryCount: number;

  constructor(content: string, leaderboardId: string, entryCount: number) {
    this.content = content;
    this.contentType = 'text/csv';
    this.leaderboardId = leaderboardId;
    this.entryCount = entryCount;
    this.exportedAt = new Date().toISOString();
    this.size = Buffer.byteLength(content, 'utf-8');
    this.filename = `leaderboard-${leaderboardId}-${this.exportedAt.replace(/[:.]/g, '-')}.csv`;
  }

  static openApi(): ApiResponseNoStatusOptions {
    return {
      description: 'Leaderboard export response with CSV content and metadata',
      type: ExportLeaderboardResponseDto,
      example: {
        content:
          '# Leaderboard Export: game-123\n# Exported at: 2024-01-15T10:30:00.000Z\nrank,userId,score,username\n1,user123,1500,PlayerOne\n2,user456,1200,PlayerTwo',
        contentType: 'text/csv',
        filename: 'leaderboard-game-123-2024-01-15T10-30-00-000Z.csv',
        size: 245,
        leaderboardId: 'game-123',
        exportedAt: '2024-01-15T10:30:00.000Z',
        entryCount: 150,
      },
    };
  }
}
