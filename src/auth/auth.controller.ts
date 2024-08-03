import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthUserDto, CreateUserDto } from './dto';
import { getField } from './decorators/find-user.decorator';
import { User } from './entities/user.entity';
import { getRawHeader } from './decorators/raw-header.decorator';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';
import { Auth } from './decorators';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('/login')
  login(@Body() authUserDto: AuthUserDto) {
    return this.authService.login(authUserDto);
  }

  @Get('check-token')
  @Auth(ValidRoles.admin)
  checkToken(@getField() user: User) {
    return this.authService.checkToken(user);
  }

  // Add the @UseGuards(AuthGuard()) decorator to protect the route EXAMPLE
  @Get('/validate')
  @UseGuards(AuthGuard())
  privateRoute(
    @getField(['email', 'name', 'fullName']) user: User,
    @getRawHeader() headers: string[],
  ) {
    return {
      message: 'This is a private route',
      statusCode: 200,
      response: { user, headers },
    };
  }

  // Add the @SetMetadata('roles', ['admin']) decorator to define the roles EXAMPLE
  @Get('/validate-meta-data')
  @SetMetadata('roles', ['admin'])
  @UseGuards(AuthGuard(), UserRoleGuard)
  validate() {
    return {
      message: 'This is a validate route',
      statusCode: 200,
    };
  }

  @Get('/validate-custom-decorator')
  @RoleProtected(ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  validateDecorator() {
    return {
      message: 'This is a validate route',
      statusCode: 200,
    };
  }

  @Get('/validate-with-decorator-composition')
  @Auth()
  validateWithDecoratorComposition() {
    return {
      message: 'This is a validate route',
      statusCode: 200,
    };
  }
}
