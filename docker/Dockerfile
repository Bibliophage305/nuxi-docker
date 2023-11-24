FROM node:20-bullseye-slim

RUN npm install -g pnpm bun \
    && npm cache clean --force

RUN mkdir -p /src
WORKDIR /src