import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductImage, Product } from './entities';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { images = [], ...productDetails } = createProductDto;

    try {
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((img) =>
          this.productImageRepository.create({ url: img }),
        ),
      });
      await this.productRepository.save(product);
      return { ...product, images };
    } catch (error) {
      this.customHandleException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    try {
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        order: { title: 'DESC' },
        relations: { images: true },
      });

      return products.map(({ images, ...product }) => ({
        ...product,
        images: images.map(({ url }) => url),
      }));
    } catch (error) {
      this.customHandleException(error);
    }
  }

  async findOne(param: string) {
    // const where: any = {};

    // if (isUUID(param)) {
    //   where.id = param;
    // } else {
    //   where.slug = param;
    // }
    // try {
    //   const product = await this.productRepository.findOne({
    //     where,
    //   });
    //   if (!product) throw new NotFoundException(`Product ${param} not found`);
    //   return product;
    // } catch (error) {
    //   this.customHandleException(error);
    // }

    let product: Product;

    if (isUUID(param)) {
      product = await this.productRepository.findOneBy({ id: param });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title)=:title or slug=:slug', {
          title: param.toUpperCase(),
          slug: param.toLowerCase(),
        })
        .leftJoinAndSelect('product.images', 'prodImg')
        .getOne();
    }

    if (!product) throw new NotFoundException(`Product ${param} not found`);

    return product;
  }

  async findOnePlain(param: string) {
    const { images = [], ...product } = await this.findOne(param);
    return {
      ...product,
      images: images.map(({ url }) => url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...productUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...productUpdate,
    });

    if (!product) throw new NotFoundException(`Product ${id} not found`);

    //create queryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    //create transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        // esto no impacta aun a la DB
        product.images = images.map((img) =>
          this.productImageRepository.create({ url: img }),
        );
      }
      // aun no impacta la base de datos
      await queryRunner.manager.save(product);
      // aqui guarda ya en la DB
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.customHandleException(error);
    }
  }

  async remove(id: string) {
    try {
      const product = await this.findOne(id);
      await this.productRepository.remove(product);
    } catch (error) {
      this.customHandleException(error);
    }
  }

  async deleteAllProducts() {
    const query = await this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.customHandleException(error);
    }
  }

  customHandleException(err: any) {
    if (err?.code === '23505')
      throw new BadRequestException(`ERROR: ${err.detail}`);
    if (err?.status === 404) throw new NotFoundException(err.message);
    this.logger.error(err);
    throw new InternalServerErrorException('Error: customHandleException');
  }
}
