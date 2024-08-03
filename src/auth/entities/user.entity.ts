import { Product } from 'src/products/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @OneToMany(() => Product, (product) => product.user)
  product: Product;

  createdAt: Date;
  updatedAt: Date;

  @BeforeInsert()
  checkFieldsInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsUpdate() {
    this.checkFieldsInsert();
  }
}
