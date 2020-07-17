// Core dependencies
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Internal dependencies
import { User } from '../../entities/User.entity';
import { CreateUserInput, GenericUserClass } from '../dto/user.dto';
import { IncorrectInputFormat } from '../exceptions/IncorrectInputFormat.exception';
import { PTC } from '../utils';
import { JWTSignPayload } from '../auth/auth.service';

class FindUser {
  uuid?: string
  auth?: string
  email?: string
}


@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(@InjectRepository(User) private user: Repository<User>) {}

  async createUser(user: CreateUserInput): Promise<GenericUserClass> {
    try {
      await this.user.insert(new User({ ...user }));
      return PTC(GenericUserClass, await this.user.findOne(user));
    } catch (error) {
      this.logger.log(error);
      throw new IncorrectInputFormat(error.message);
    }
  }
  
  async fetchUserByEmail({ email }: FindUser): Promise<User> {
    return await this.user.findOneOrFail({ email })
  }

  async fetchUserByAuthToken(sub: JWTSignPayload): Promise<User> {
    return await this.user.findOneOrFail({ uuid: sub.uuid })
  }
}
