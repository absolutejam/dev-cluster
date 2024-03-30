#!/usr/bin/env bash

root=$(git rev-parse --show-toplevel)
source "${root}/bin/gitea_lib.sh"

GITEA_HOST=$(skate get 'gitea-host')
GITEA_USERNAME=$(skate get 'gitea-username')
GITEA_PASSWORD=$(skate get 'gitea-password')

SKATE_KEY=npm-token@dev-cluster
CLIENT_NAME=woodpecker
REDIRECT_URI=https://woodpecker.dev-cluster.local/authorize

generate_oauth_client_resp=$(generate_oauth_client)
gum log -l info -t kitchen -s "Woodpecker OAuth client generated" "key" "${SKATE_KEY}"
skate set "${SKATE_KEY}" <<<"${generate_oauth_client_resp}"
