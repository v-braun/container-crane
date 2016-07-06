FROM node:6

MAINTAINER v-braun <v-braun@live.de>

RUN apt-get update && apt-get install -y curl
RUN curl -sSL https://get.docker.com/ | sh

EXPOSE 3000