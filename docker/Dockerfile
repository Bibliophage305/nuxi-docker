FROM node:20-bullseye-slim

ARG DOCKER_USER_UID
ARG DOCKER_USER_GID

COPY free_gid.sh /usr/local/bin/

# If the GID is in use, free it up with a script
RUN chmod +x /usr/local/bin/free_gid.sh \
    && /usr/local/bin/free_gid.sh "$DOCKER_USER_GID"

RUN groupmod -g $DOCKER_USER_GID node \
    && usermod -u $DOCKER_USER_UID -g $DOCKER_USER_GID node

RUN npm install -g pnpm bun

RUN mkdir -p /home/node/src
WORKDIR /home/node/src