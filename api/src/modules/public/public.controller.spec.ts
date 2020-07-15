import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import * as moment from 'moment';
import { clone } from 'lodash';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Internal dependencies
import { CreateUserInput, GenericUserClass } from '../../common/dto/user.dto';
import { UserService } from '../../common/services/user.service';
import { PublicController } from './public.controller';
import { User } from '../../entities/User.entity';
import * as getORMConfig from '../../config/orm.config';
import * as getJWTConfig from '../../config/jwt.config';
import { SecurePasswordPipe } from '../../common/pipes/secure-password.pipe';
import { ValidateLoginPipe } from '../../common/pipes/validate-login.pipe';
import { LoginUserInput, LoginUserOutput } from '../../common/dto/auth.dto';
import { IncorrectInputFormat } from '../../common/exceptions/IncorrectInputFormat.exception';
import { AuthService } from '../../common/auth/auth.service';
import { RevokedToken } from '../../entities/RevokedToken.entity';

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

  describe('Signup', () => {
    it('send new user info', async () => {

      // Execute sign up
      const securedUserInfo = await new SecurePasswordPipe().transform(clone(newUser), null)
      const signup: GenericUserClass = await controller.signUp(securedUserInfo);
      console.log(`New User:`, signup);

      expect(signup).toBeTruthy();
      expect(signup.uuid).toBeTruthy();
      expect(signup.password).not.toEqual(newUser.password)

      // Assemble login credentials
      const login: LoginUserInput = {
        email: newUser.email,
        password: 'WRONG PASSWORD'
      }
      const validateLoginInfoPipe = new ValidateLoginPipe(app.get(getRepositoryToken(User)))

      // Execute signin with error
      try {
        await validateLoginInfoPipe.transform(login, null)
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
    });
  });
});
