import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Internal dependencies
import { User } from '../../entities/User.entity';
import { LoginUserInput } from '../dto/auth.dto';
import { err, INVALID_LOGIN_CREDENTIALS } from '../exceptions/message.exception';
import { IncorrectInputFormat } from '../exceptions/IncorrectInputFormat.exception';

@Injectable()
export class ValidateLoginPipe implements PipeTransform {
  private readonly logger = new Logger(ValidateLoginPipe.name);

  constructor(
    @InjectRepository(User) private users: Repository<User>
  ) {}

  async transform(credentials: LoginUserInput, metadata: ArgumentMetadata): Promise<LoginUserInput> {
    const { email, password } = credentials
    const user: User = await this.users.findOne({ email, disabled: false });

    this.logger.log(user)
    if (user) {
      const isMatch: boolean = await bcrypt.compare(password, user.password);

      this.logger.log(`match ${isMatch}`)
      if (isMatch) return credentials;
      else throw new IncorrectInputFormat(err(INVALID_LOGIN_CREDENTIALS, {email, password}))
    }
    else {
      throw new IncorrectInputFormat(err(INVALID_LOGIN_CREDENTIALS, {email, password}))
    }
  }
}
