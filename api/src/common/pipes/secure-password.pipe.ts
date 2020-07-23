import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Internal dependencies
import constants from '../constants';
import { CreateUserInput } from '../dto/user.dto';
import { log } from '../utils';

@Injectable()
export class SecurePasswordPipe implements PipeTransform {
  async transform(body: CreateUserInput, metadata: ArgumentMetadata): Promise<CreateUserInput> {
    /**
     * Since password is a sensitive information,
     * we need to make it as UNREADABLE as early as possible to keep secrecy
     */
    const hash = await bcrypt.hash(body.password, constants.SALT_ROUNDS);
    body.password = hash;

    log({message: `Securing password for ${body.email}`})
    return body;
  }
}
