import { Module } from '@nestjs/common';

// Internal dependencies
import { PublicController } from './auth.controller';
import { UserService } from '../../common/services/user.service';
import { AuthService } from '../../common/auth/auth.service';
import { JwtStrategy } from '../../common/auth/auth.strategy';

@Module({
  controllers: [PublicController],
  providers: [UserService, AuthService, JwtStrategy],
})
export class AuthModule {}
