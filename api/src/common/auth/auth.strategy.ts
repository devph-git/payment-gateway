import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

// Internal dependencies
import { UserService } from '../services/user.service';
import { User } from '../../entities/User.entity';
import { JWTSignPayload } from './auth.service';
import { err, INACTIVE_USER, EXPIRED_AUTH_TOKEN } from '../exceptions/message.exception';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET_KEY,
    });
  }

  async validate(jwtPayload: JWTSignPayload): Promise<User> {
    const user = await this.userService.fetchUserByAuthToken(jwtPayload);
    
    if (user.disabled) {
      throw new UnauthorizedException(err(INACTIVE_USER, {email: user.email}));
    } else if (!user.auth) {
      throw new UnauthorizedException(EXPIRED_AUTH_TOKEN);
    }

    return user
  }
}
