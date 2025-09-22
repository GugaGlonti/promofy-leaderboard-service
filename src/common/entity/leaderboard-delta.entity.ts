import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Leaderboard } from './leaderboard.entity';

@Entity()
export class LeaderboardDelta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  playerId: number;

  @Column()
  scoreDelta: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToMany(() => Leaderboard, (leaderboard) => leaderboard.deltas)
  leaderboards: Leaderboard[];
}
