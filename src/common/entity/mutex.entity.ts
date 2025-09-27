import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Mutex {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', default: false })
  isLocked: boolean;

  @Column({ type: 'varchar', nullable: false })
  resource: string;

  @Column({ type: 'timestamp', nullable: true })
  acquiredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  succeededAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date;
}
