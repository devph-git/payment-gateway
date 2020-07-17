import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as moment from 'moment';

// Internal dependencies
import { AppModule } from '../src/modules/app.module';
import { GenericUserClass } from '../src/common/dto/user.dto';
import { INCORRECT_INPUT_FORMAT_EXCEPTION } from '../src/common/exceptions/IncorrectInputFormat.exception';
import { LoginUserOutput } from '../src/common/dto/auth.dto';
import { getManager } from 'typeorm';
import { RevokedToken } from '../src/entities/RevokedToken.entity';
import { User } from 'src/entities/User.entity';

describe('Seller (end to end testing)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  it('Default seller generic user flow', async done => {
    const usrRand = Math.random()
      .toString(36)
      .slice(2);
    let newUser: any = {
      email: `${usrRand}@email.com`,
      username: `${usrRand}`,
      password: 'supersecret',
      primaryAddress: {
        country: 'PH'
      },
      birthDate: moment('07-31-1990', 'MM-DD-YYYY').toDate(),
    };

    // Signup a test user
    newUser.primaryAddress['unknownProperty'] = 'TEST'
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(newUser)
      .then(res => {
        console.log('New user w/ wrong input error:', res.body);
        expect(res.status).toEqual(400);
      });
    delete newUser.primaryAddress['unknownProperty']
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(newUser)
      .then(res => {
        console.log('New user:', res.body);
        expect(res.status).toEqual(201);

        const body: GenericUserClass = res.body;
        expect(body.uuid).toBeTruthy();
        expect(body.email).toEqual(newUser.email);
        expect(body.username).toEqual(newUser.username);
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
        password: newUser.password
      })
      .then(res => {
        console.log('Login User:', res.body);

        signedUser = res.body;
        expect(res.status).toEqual(201);
        expect(signedUser.token).toBeTruthy();
      });
    // ---------------------------------------------------------

    // Logout user
    await request(app.getHttpServer())
      .post('/auth/logout')
      .send()
      .then(res => {
        console.log('Logout User w/ error due to no Authorization header:', res.body);
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
      .then(async (res) => {
        console.log('Try if auth has been revoked:', res.body);
        expect(res.status).toEqual(401);

        // confirm if jwt token was moved to revoked
        const expiredToken = await getManager().transaction(async manager => {
          return await manager.findOne(RevokedToken, { token: signedUser.token });
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
