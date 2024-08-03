import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const getRawHeader = createParamDecorator((_, ctx: ExecutionContext) => {
  const { rawHeaders = [] } = ctx.switchToHttp().getRequest();
  return rawHeaders;
});
