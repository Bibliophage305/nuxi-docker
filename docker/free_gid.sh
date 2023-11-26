#!/bin/bash

DOCKER_USER_GID="$1"
EXISTING_GROUP=$(getent group "$DOCKER_USER_GID")

if [ -n "$EXISTING_GROUP" ] && [ "$(echo "$EXISTING_GROUP" | cut -d: -f1)" != "node" ]; then
    NEW_GID=1000
    while getent group "$NEW_GID" >/dev/null; do
        ((NEW_GID++))
    done

    groupmod -g "$NEW_GID" "$(echo "$EXISTING_GROUP" | cut -d: -f1)"
fi
