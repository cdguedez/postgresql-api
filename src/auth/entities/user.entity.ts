import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type Role = 'admin' | 'user' | 'guest';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: true, unique: true })
  email: string;

  @Column('text', { nullable: false })
  password: string;

  @Column('text', { nullable: false })
  fullName: string;

  @Column('enum', { enum: ['admin', 'user', 'guest'], default: 'user' })
  role: Role;

  @Column('bool', { default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}
