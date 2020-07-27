# base image
FROM node:14.4.0-alpine

# include bash
RUN apk add bash

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
