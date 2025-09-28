import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  Index,
  Unique,
} from 'typeorm';
import { Leaderboard } from './leaderboard.entity';

@Entity({ name: 'LEADERBOARD_DELTAS' })
@Unique('UQ_LEADERBOARD_DELTA', ['playerId', 'scoreDelta', 'createdAt'])
export class LeaderboardDelta {
  @PrimaryGeneratedColumn('uuid', { name: 'ID' })
  id: string;

  @Column({ name: 'PLAYER_ID' })
  @Index()
  playerId: number;

  @Column({ name: 'SCORE_DELTA' })
  scoreDelta: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'CREATED_AT',
  })
  createdAt: Date;

  @ManyToMany(() => Leaderboard, (leaderboard) => leaderboard.deltas)
  leaderboards: Leaderboard[];
}
