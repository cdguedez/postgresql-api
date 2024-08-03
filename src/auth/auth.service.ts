import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { AuthUserDto, CreateUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  private findJwtUser(payload: JwtPayload) {
    const Token = this.jwtService.sign(payload);
    return Token;
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password: passwordBcrypt, ...dataUser } = createUserDto;

      const newUser = this.userRepository.create({
        ...dataUser,
        password: bcrypt.hashSync(passwordBcrypt, 10),
      });
      await this.userRepository.save(newUser);
      const { password: _, ...userWithOutPassword } = newUser;
      return {
        ...userWithOutPassword,
        token: this.findJwtUser({ id: userWithOutPassword.id }),
      };
    } catch (error) {
      this.customHandleException(error);
    }
  }

  async login(authUserDto: AuthUserDto) {
    const { password, email } = authUserDto;
    const findUser = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });
    if (!findUser) {
      throw new BadRequestException('Credentials are not valid (email)');
    }
    if (!bcrypt.compareSync(password, findUser.password)) {
      throw new BadRequestException('Credentials are not valid (password)');
    }
    return { ...findUser, token: this.findJwtUser({ id: findUser.id }) };
  }

  async checkToken(user: User) {
    return { ...user, token: this.findJwtUser({ id: user.id }) };
  }

  private customHandleException(error: any): never {
    this.logger.error(error);
    if (error.code === '23505') {
      throw new BadRequestException(`ERROR: ${error.detail}`);
    }
    throw new InternalServerErrorException('Internal server error');
  }
}
