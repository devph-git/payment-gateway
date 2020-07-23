import { ConfigService } from '@nestjs/config';
import constants from '../common/constants';

const getConfig = (env: ConfigService) => {
  const config = {
    secret: env.get('SECRET_KEY'),
    signOptions: { expiresIn: env.get('JWT_LIFESPAN') },
  };

  return config;
};

export = getConfig;
