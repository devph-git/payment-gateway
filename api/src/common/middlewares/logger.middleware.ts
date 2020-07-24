import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

// Internal dependencies
import { log } from '../utils';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    log({ message: `Call at: ${req.url} w/ headers: ${req.rawHeaders}` });

    next();
  }
}
