import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validateRole: string[] = this.reflector.get(
      META_ROLES,
      ctx.getHandler(),
    );
    const user: User | null = ctx.switchToHttp().getRequest()?.user;

    if (!user) {
      throw new ForbiddenException('User not found (request)');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User is not active');
    }

    if (!validateRole.includes(user.role)) {
      throw new ForbiddenException(`User need to be role ${validateRole}`);
    }

    return true;
  }
}
