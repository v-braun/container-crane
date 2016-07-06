FROM node:6

RUN apt-get update && apt-get install -y curl docker.io

EXPOSE 3000