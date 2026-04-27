import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'profiles' })
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: false, name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'avatar' })
  avatarUrl: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'biography' })
  biography: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'phone' })
  phone: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updateAt: Date;
}
