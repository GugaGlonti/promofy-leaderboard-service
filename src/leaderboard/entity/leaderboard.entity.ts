import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Leaderboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('int')
  score: number;

  @Column()
  periodKey: string;

  @CreateDateColumn()
  createdAt: Date;
}
