import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password: passwordBcrypt, ...dataUser } = createUserDto;

      const newUser = this.userRepository.create({
        ...dataUser,
        password: bcrypt.hashSync(passwordBcrypt, 10),
      });
      await this.userRepository.save(newUser);
      const { password: _, ...userWithOutPassword } = newUser;
      return userWithOutPassword;
    } catch (error) {
      this.customHandleException(error);
    }
  }

  private customHandleException(error: any): never {
    this.logger.error(error);
    if (error.code === '23505') {
      throw new BadRequestException(`ERROR: ${error.detail}`);
    }
    throw new InternalServerErrorException('Internal server error');
  }
}
