import { HttpException, HttpStatus } from '@nestjs/common';

export const INCORRECT_INPUT_FORMAT_EXCEPTION = 'INCORRECT_INPUT_FORMAT';

export class IncorrectInputFormat extends HttpException {
  constructor(exception: object | string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(
      { message: exception, alias: INCORRECT_INPUT_FORMAT_EXCEPTION },
      status,
    );
  }
}
