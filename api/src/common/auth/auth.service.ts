import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from '../../entities/User.entity';
import { RevokedToken } from '../../entities/RevokedToken.entity';
import { LoginUserOutput } from '../dto/auth.dto';
import { PTC } from '../utils';

export interface JWTSignPayload {
  email: string
  uuid: string
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private user: Repository<User>,
    @InjectRepository(RevokedToken) private revoked: Repository<RevokedToken>,
    private jwtService: JwtService,
  ) {}

  async login(user: User): Promise<LoginUserOutput> {
    const sub: JWTSignPayload = { email: user.email, uuid: user.uuid }
    const token = await this.jwtService.sign(sub);
    await this.user.update(user.id, { auth: token });

    this.logger.log(`Logging in: ${user.email}`)
    return PTC(LoginUserOutput, { token });
  }

  async logout(user: User): Promise<void> {
    await this.user.update(user.id, { auth: null });
    await this.revoked.insert(new RevokedToken({ token: user.auth }));
  }
}
