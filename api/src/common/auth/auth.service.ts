import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../../entities/User.entity';
import { RevokedToken } from '../../entities/RevokedToken.entity';
import { LoginUserOutput, RefreshAuthInput } from '../dto/auth.dto';
import { PTC, log } from '../utils';

export interface JWTSignPayload {
  email: string;
  uuid: string;
  stamp: string;
  __id: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private user: Repository<User>,
    @InjectRepository(RevokedToken) private revoked: Repository<RevokedToken>,
    private jwtService: JwtService,
  ) {}

  async login(user: User): Promise<LoginUserOutput> {
    const sub: JWTSignPayload = {
      email: user.email,
      uuid: user.uuid,
      stamp: moment().toString(),
      __id: uuidv4(),
    };
    const token = await this.jwtService.sign(sub);
    const refreshToken = await this.jwtService.sign(sub, {
      expiresIn: process.env.JWT_REFRESH_LIFESPAN,
    });
    await this.user.update(user.id, { auth: token, refreshToken });

    log({ message: `Logging in: ${user.email}` });
    return PTC(LoginUserOutput, { token, refreshToken });
  }

  async logout(user: User): Promise<void> {
    await this.user.update(user.id, { auth: null });
    await this.revoked.insert(new RevokedToken({ token: user.auth }));
  }

  async refreshToken({
    uuid,
    refreshToken,
  }: RefreshAuthInput): Promise<LoginUserOutput> {
    const user: User = await this.user.findOneOrFail({ uuid, refreshToken });
    const oldAuth = user.auth;
    const isValidRefreshToken: object = this.jwtService.verify(refreshToken);

    let token = null;
    if (isValidRefreshToken) {
      const sub: JWTSignPayload = {
        email: user.email,
        uuid: user.uuid,
        stamp: moment().toString(),
        __id: uuidv4(),
      };

      token = await this.jwtService.sign(sub);
      await this.user.update(user.id, { auth: token });

      await this.revoked.insert(new RevokedToken({ token: oldAuth }));
    }

    log({ message: `Logging in: ${user.email} w/ token ${token}` });
    return PTC(LoginUserOutput, { token, refreshToken });
  }
}
