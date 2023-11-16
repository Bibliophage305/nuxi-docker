FROM node:20-alpine

# install glibc to successfully install bun
# https://github.com/oven-sh/bun/issues/5545#issuecomment-1722306576
RUN apk --no-cache add ca-certificates wget \
    && wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub \
    && wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.28-r0/glibc-2.28-r0.apk \
    && apk add --no-cache --force-overwrite glibc-2.28-r0.apk

RUN npm install -g pnpm bun nuxi

RUN mkdir -p /src
WORKDIR /src