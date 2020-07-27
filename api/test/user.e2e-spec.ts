import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import moment from 'moment';

// Internal dependencies
import { AppModule } from '../src/modules/app.module';
import { GenericUserClass } from '../src/common/dto/user.dto';
import { alias as INCORRECT_INPUT_FORMAT_EXCEPTION } from '../src/common/exceptions/IncorrectInputFormat.exception';
import { LoginUserOutput, RefreshAuthInput } from '../src/common/dto/auth.dto';
import { getManager } from 'typeorm';
import { RevokedToken } from '../src/entities/RevokedToken.entity';

describe('Seller (end to end testing)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  it('Default seller generic user flow', async done => {
    const usrRand = Math.random()
      .toString(36)
      .slice(2);
    const newUser: any = {
      email: `${usrRand}@email.com`,
      username: `${usrRand}`,
      password: 'supersecret',
      primaryAddress: {
        country: 'PH',
      },
      birthDate: moment('07-31-1990', 'MM-DD-YYYY').toDate(),
    };
    let createdUser: GenericUserClass = null;

    // Signup a test user
    newUser.primaryAddress['unknownProperty'] = 'TEST';
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(newUser)
      .then(res => {
        console.log('New user w/ wrong input error:', res.body);
        expect(res.status).toEqual(400);
      });
    delete newUser.primaryAddress['unknownProperty'];
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(newUser)
      .then(res => {
        console.log('New user:', res.body);
        expect(res.status).toEqual(201);

        createdUser = res.body;
        expect(createdUser.uuid).toBeTruthy();
        expect(createdUser.email).toEqual(newUser.email);
        expect(createdUser.username).toEqual(newUser.username);
      });
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(newUser)
      .then(res => {
        console.log('New user w/ Duplicate User Error:', res.body);
        expect(res.status).toEqual(500);
        expect(res.body.alias).toEqual(INCORRECT_INPUT_FORMAT_EXCEPTION);
      });
    // ---------------------------------------------------------

    // Login user
    let signedUser: LoginUserOutput;
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: newUser.email,
        password: newUser.password,
      })
      .then(res => {
        console.log('Login User:', res.body);

        signedUser = res.body;
        expect(res.status).toEqual(201);
        expect(signedUser.token).toBeTruthy();
        expect(signedUser.refreshToken).toBeTruthy();
      });
    // ---------------------------------------------------------

    // test refresh token
    const refreshTokenInput: RefreshAuthInput = {
      uuid: createdUser.uuid,
      refreshToken: signedUser.refreshToken,
    };
    const oldToken = signedUser.refreshToken;
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send(refreshTokenInput)
      .then(res => {
        console.log('Fetch refresh token:', res.body);
        expect(res.status).toEqual(201);

        signedUser = res.body;
        expect(res.status).toEqual(201);
        expect(signedUser.token).toBeTruthy();
        expect(signedUser.refreshToken).toBeTruthy();
      });
    // ---------------------------------------------------------

    // Logout user
    await request(app.getHttpServer())
      .post('/auth/logout')
      .send()
      .then(res => {
        console.log(
          'Logout User w/ error due to no Authorization header:',
          res.body,
        );
        expect(res.status).toEqual(401);
      });
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', 'WRONG TOKEN')
      .send()
      .then(res => {
        console.log('Logout User w/ error due to no Auth:', res.body);
        expect(res.status).toEqual(401);
      });
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${oldToken}`)
      .send()
      .then(res => {
        console.log('Logout User w/ error due to old Auth:', res.body);
        expect(res.status).toEqual(401);
      });
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${signedUser.token}`)
      .send()
      .then(res => {
        console.log('Logout User and revoke auth token:', res.body);
        expect(res.status).toEqual(201);
      });
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${signedUser.token}`)
      .send()
      .then(async res => {
        console.log('Try if auth has been revoked:', res.body);
        expect(res.status).toEqual(401);

        // confirm if jwt token was moved to revoked
        const expiredToken = await getManager().transaction(async manager => {
          return await manager.findOne(RevokedToken, {
            token: signedUser.token,
          });
        });

        expect(expiredToken).toBeTruthy;
      });
    // ---------------------------------------------------------

    done();
  });

  afterAll(async () => {
    await app.close();
  });
});
