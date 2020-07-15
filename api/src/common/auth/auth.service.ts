import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from '../../entities/User.entity';
import { RevokedToken } from '../../entities/RevokedToken.entity';
import { LoginUserOutput } from '../dto/auth.dto';
import { PTC } from '../utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(RevokedToken) private revoked: Repository<RevokedToken>,
    private jwtService: JwtService,
  ) {}

  async login(user: User): Promise<LoginUserOutput> {
    const token = await this.jwtService.sign({
      username: user.username,
      sub: user.uuid,
      nth: Math.random(),
    });
    await this.users.update(user.id, { auth: token });

    this.logger.log(`Logging in: ${user.email}`)
    return PTC(LoginUserOutput, { token });
  }

  // async logout(author: Author): Promise<void> {
  //   const tmp = author.user.auth;
  //   await this.users.update(author.user.id, { auth: null });
  //   await this.revokedTokens.insert(new RevokedToken({ auth: tmp }));
  // }
}
