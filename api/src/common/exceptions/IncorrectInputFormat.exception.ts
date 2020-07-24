import { HttpException, HttpStatus } from '@nestjs/common';

export const alias = 'INCORRECT_INPUT_FORMAT_EXCEPTION';

export class IncorrectInputFormat extends HttpException {
  constructor(exception: object | string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(
      { message: exception, alias },
      status,
    );
  }
}
