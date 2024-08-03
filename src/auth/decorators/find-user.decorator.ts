import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const getField = createParamDecorator(
  (data: string[], ctx: ExecutionContext) => {
    const { user = null } = ctx.switchToHttp().getRequest();
    if (!user) {
      throw new UnauthorizedException('User not found (request)');
    }
    if (data?.length) {
      const filteredUser = data.reduce((acc, field) => {
        acc[field] = user[field];
        return acc;
      }, {});
      return filteredUser;
    }
    return user;
  },
);
