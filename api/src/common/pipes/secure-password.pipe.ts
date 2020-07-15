import { PipeTransform, Injectable, ArgumentMetadata, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Internal dependencies
import constants from '../constants';
import { CreateUserInput } from '../dto/user.dto';

@Injectable()
export class SecurePasswordPipe implements PipeTransform {
  private readonly logger = new Logger(SecurePasswordPipe.name);

  async transform(body: CreateUserInput, metadata: ArgumentMetadata): Promise<CreateUserInput> {
    /**
     * Since password is a sensitive information,
     * we need to make it as UNREADABLE as early as possible to keep secrecy
     */
    const hash = await bcrypt.hash(body.password, constants.SALT_ROUNDS);
    body.password = hash;

    this.logger.log(`Securing password for ${body.email}`)
    return body;
  }
}
