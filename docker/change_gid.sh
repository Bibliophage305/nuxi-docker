#!/bin/bash

DOCKER_USER_GID="$1"
EXISTING_GROUP=$(getent group "$DOCKER_USER_GID")

if [ -n "$EXISTING_GROUP" ]; then
    NEW_GID=$(getent group | cut -d: -f3 | grep -E "^1[0-9]{3}$" | sort -n | tail -n 1 | awk '{ print $1+1 }')
    groupmod -g "$NEW_GID" "$(echo "$EXISTING_GROUP" | cut -d: -f1)"
fi
