import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

import { initialData } from './data/seed-data';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private async insertSeedUsers(): Promise<User> {
    await this.usersRepository.delete({});

    const seedUsers = initialData.users;

    const insertPromise: User[] = [];

    seedUsers.forEach((user) => {
      insertPromise.push(this.usersRepository.create(user));
    });

    const dbUser = await this.usersRepository.save(insertPromise);

    return dbUser[0];
  }

  private async insertSeedProducts(user: User) {
    await this.productsService.deleteAllProducts();

    const seedProducts = initialData.products;

    const insertPromise = [];

    seedProducts.forEach((prod) => {
      insertPromise.push(this.productsService.create(prod, user));
    });

    await Promise.all(insertPromise);
  }

  private async deletedAllTables() {
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.usersRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  async runSeed() {
    await this.deletedAllTables();
    const firstUser = await this.insertSeedUsers();
    await this.insertSeedProducts(firstUser);
    return 'SEED SUCCESS!';
  }
}
