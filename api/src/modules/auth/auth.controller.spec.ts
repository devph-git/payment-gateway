import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import * as moment from 'moment';
import { clone } from 'lodash';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getManager } from 'typeorm';

// Internal dependencies
import { CreateUserInput, GenericUserClass } from '../../common/dto/user.dto';
import { UserService } from '../../common/services/user.service';
import { PublicController } from './auth.controller';
import { User } from '../../entities/User.entity';
import * as getORMConfig from '../../config/orm.config';
import { SecurePasswordPipe } from '../../common/pipes/secure-password.pipe';
import { ValidateLoginPipe } from '../../common/pipes/validate-login.pipe';
import { LoginUserInput, LoginUserOutput } from '../../common/dto/auth.dto';
import { IncorrectInputFormat } from '../../common/exceptions/IncorrectInputFormat.exception';
import { AuthService } from '../../common/auth/auth.service';
import { RevokedToken } from '../../entities/RevokedToken.entity';
import { JwtStrategy } from '../../common/auth/auth.strategy';
import { UnauthorizedException } from '@nestjs/common';

describe('Test controller', () => {
  let controller: PublicController;

  const usrRand = Math.random()
    .toString(36)
    .slice(2);
  let newUser: CreateUserInput = {
    email: `${usrRand}@email.com`,
    username: `${usrRand}`,
    password: 'supersecret',
    primaryAddress: {
      country: 'PH',
    },
    birthDate: moment('07-31-1990', 'MM-DD-YYYY').toDate(),
  };

  let app: TestingModule
  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (config: ConfigService) => getORMConfig(config),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([User, RevokedToken]),
        PassportModule,
        JwtModule.register({
          secret: 'test secret',
          signOptions: { expiresIn: '60s' }
        }),
      ],
      controllers: [PublicController],
      providers: [UserService, AuthService],
    }).compile();

    controller = app.get<PublicController>(PublicController);
  });

  describe('Auth', () => {
    it('test signup, login, and logout flow', async () => {

      // Execute sign up
      const securedUserInfo = await new SecurePasswordPipe().transform(clone(newUser), null)
      const signup: GenericUserClass = await controller.signUp(securedUserInfo);
      console.log(`New User:`, signup);
      expect(signup).toBeTruthy();
      expect(signup.uuid).toBeTruthy();
      expect(signup.password).not.toEqual(newUser.password)

      // Assemble login credentials
      const login: LoginUserInput = { email: newUser.email, password: 'WRONG PASSWORD' }
      const validateLoginInfoPipe = new ValidateLoginPipe(app.get(getRepositoryToken(User)))

      // Execute signin with error
      try {
        await validateLoginInfoPipe.transform(login, null)
      }
      catch(error) {
        expect(error).toBeInstanceOf(IncorrectInputFormat)
      }

      // Execute signin for unknown user
      try {
        await validateLoginInfoPipe.transform({ email: 'unknown@email.com', password: '' }, null)
      }
      catch(error) {
        expect(error).toBeInstanceOf(IncorrectInputFormat)
      }

      // Execute signin without error
      login.password = newUser.password
      const validateLoginInfo = await validateLoginInfoPipe.transform(login, null)
      const signin: LoginUserOutput = await controller.signIn(validateLoginInfo);
      console.log(`Login User:`, signin);
      expect(signin.token).toBeTruthy()

      // Execute logout
      const user = await getManager().transaction(async manager => await manager.findOne(User, { uuid: signup.uuid }));
      const strategy = new JwtStrategy(new UserService(app.get(getRepositoryToken(User))))
      await strategy.validate({ email: user.email, uuid: user.uuid })
      await controller.signOut({ user });
      const expiredToken = await getManager().transaction(async manager => await manager.findOne(RevokedToken, { token: signin.token }));
      expect(expiredToken).toBeTruthy()

      // Execute logout w/ expired token causing unauthorized access
      try {
        await strategy.validate({ email: user.email, uuid: user.uuid })
      }
      catch(error) {
        expect(error).toBeInstanceOf(UnauthorizedException)
      }

      // Execute logout w/ expired token causing duplicate revoked token
      try {
        await controller.signOut({ user });
      }
      catch(error) {
        expect(error).toBeTruthy()
      }
    });
  });
});
