import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { duration } from 'moment';

// Internal dependencies
import { log } from '../utils';

@Injectable()
export class ReactionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // API triggered by client
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const reaction = duration(Date.now() - now, 'milliseconds');
        log({ message: `fin: ${reaction.asSeconds()}ms` });
      }),
    );
  }
}
