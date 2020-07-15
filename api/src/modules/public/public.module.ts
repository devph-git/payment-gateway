import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Internal dependencies
import { PublicController } from './public.controller';
import { UserService } from '../../common/services/user.service';
import { AuthService } from '../../common/auth/auth.service';

@Module({
  controllers: [PublicController],
  providers: [UserService, AuthService, JwtService],
})
export class PublicModule {}
