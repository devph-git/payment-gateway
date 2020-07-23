# base image
FROM node:14.4.0-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json

# install nest
RUN yarn global add @nestjs/cli

# use yarn to install dependencies
RUN yarn --force

ENV APP_HOST=devphio_payment_gateway_api
ENV APP_PORT=3000
ENV SECRET_KEY='Allah is great! I know.'
ENV JWT_LIFESPAN=12h
ENV JWT_REFRESH_LIFESPAN=7d
ENV TYPEORM_CONNECTION=postgres
ENV TYPEORM_HOST=devphio_payment_gateway_db
ENV TYPEORM_PORT=5432
ENV TYPEORM_USERNAME=devph_io_admin
ENV TYPEORM_PASSWORD=DEVPHIO_supersecret
ENV TYPEORM_DATABASE=payment-gateway
ENV TYPEORM_SYNCHRONIZE=false
ENV TYPEORM_LOGGING=true
ENV TYPEORM_ENTITIES=src/**/**.entity.ts
ENV TYPEORM_MIGRATIONS=src/migrations/**.ts
ENV TYPEORM_MIGRATIONS_DIR=src/migrations
ENV TYPEORM_MIGRATIONS_RUN=false
