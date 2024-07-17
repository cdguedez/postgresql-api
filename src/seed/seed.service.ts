import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}

  private async insertSeedProducts() {
    await this.productsService.deleteAllProducts();

    const seedProducts = initialData.products;

    const insertPromise = [];

    seedProducts.forEach((prod) => {
      insertPromise.push(this.productsService.create(prod));
    });

    await Promise.all(insertPromise);
  }

  async runSeed() {
    await this.insertSeedProducts();
    return 'SEED SUCCESS!';
  }
}
