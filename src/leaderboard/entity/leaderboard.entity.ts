import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { LeaderboardDelta } from './leaderboard-delta.entity';
import { UTCUtils } from '../utc-utils';
import { LeaderboardType } from '../enum/leaderboard-type.enum';

@Entity({ name: 'LEADERBOARDS' })
@Unique(['type', 'startDate', 'endDate'])
export class Leaderboard {
  @PrimaryGeneratedColumn('uuid', { name: 'ID' })
  id: string;

  @Column({ nullable: false, name: 'TYPE' })
  type: LeaderboardType;

  @Column({ nullable: false, type: 'timestamp', name: 'START_DATE' })
  startDate: Date;

  @Column({ nullable: false, type: 'timestamp', name: 'END_DATE' })
  endDate: Date;

  @ManyToMany(() => LeaderboardDelta, (delta) => delta.leaderboards)
  @JoinTable({
    name: 'LEADERBOARD_DELTA_MAPPING',
    joinColumn: { name: 'LEADERBOARD_ID', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'DELTA_ID', referencedColumnName: 'id' },
  })
  deltas: LeaderboardDelta[];

  public toString(): string {
    return `[${this.id}] ${this.type} (${this.startDate.toString()} - ${this.endDate.toString()})`
      .replace('(Central European Summer Time)', '')
      .replace('(Central European Summer Time)', '')
      .replace('(Central European Standard Time)', '')
      .replace('(Central European Standard Time)', '')
      .replace('(Coordinated Universal Time)', '')
      .replace('(Coordinated Universal Time)', '')
      .trim();
  }

  static DAILY(): Partial<Leaderboard> {
    return {
      type: LeaderboardType.DAILY,
      startDate: UTCUtils.getStartOfDay(),
      endDate: UTCUtils.getEndOfDay(),
    };
  }

  static WEEKLY(): Partial<Leaderboard> {
    return {
      type: LeaderboardType.WEEKLY,
      startDate: UTCUtils.getStartOfWeek(),
      endDate: UTCUtils.getEndOfWeek(),
    };
  }

  static MONTHLY(): Partial<Leaderboard> {
    return {
      type: LeaderboardType.MONTHLY,
      startDate: UTCUtils.getStartOfMonth(),
      endDate: UTCUtils.getEndOfMonth(),
    };
  }

  static ALL_TIME(): Partial<Leaderboard> {
    return {
      type: LeaderboardType.ALL_TIME,
      startDate: UTCUtils.getMinDate(),
      endDate: UTCUtils.getMaxDate(),
    };
  }
}
