import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DateTime } from 'luxon';
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true, nullable: false })
  title: string;

  @Column('float', { nullable: false, default: 0 })
  price: number;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { unique: true, nullable: false })
  slug: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column('boolean', { default: false })
  published: boolean;

  @Column('text', { array: true })
  sizes: string[];

  @Column('enum', { enum: ['men', 'women', 'kid', 'unisex'] })
  gender: string;

  //TAGS
  @Column('text', { array: true, default: [] })
  tags: string[];

  //IMAGES
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @BeforeInsert()
  checkSlug() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug.toLowerCase().replaceAll(' ', '-');
  }

  @BeforeInsert()
  checkCreatedAt() {
    this.created_at = DateTime.local().toJSDate();
    this.updated_at = DateTime.local().toJSDate();
  }

  @BeforeUpdate()
  checkSlugOnUpdate() {
    this.slug = this.slug.toLowerCase().replaceAll(' ', '-');
  }

  @BeforeUpdate()
  checkUpdatedAt() {
    this.updated_at = DateTime.local().toJSDate();
  }
}
