import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LeaderboardDelta } from './leaderboard-delta.entity';

@Entity()
export class Leaderboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: 'daily' | 'weekly' | 'all-time';

  @Column({ type: 'date', nullable: true })
  date?: string;

  @Column({ nullable: true })
  weekNumber?: number;

  @Column({ nullable: true })
  year?: number;

  @ManyToMany(() => LeaderboardDelta, (delta) => delta.leaderboards)
  @JoinTable()
  deltas: LeaderboardDelta[];
}
