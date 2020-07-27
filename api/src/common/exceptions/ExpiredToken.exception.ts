import { HttpException, HttpStatus } from '@nestjs/common';

export const alias = 'EXPIRED_TOKEN_EXCEPTION';

export class ExpiredTokenException extends HttpException {
  constructor(
    exception: object | string,
    status: HttpStatus = HttpStatus.UNAUTHORIZED,
  ) {
    super({ message: exception, alias }, status);
  }
}
