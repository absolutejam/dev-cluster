#!/usr/bin/env bash

source "${root}/bin/gitea_lib.sh"

GITEA_HOST=$(skate get 'gitea-host')
GITEA_USERNAME=$(skate get 'gitea-username')
GITEA_PASSWORD=$(skate get 'gitea-password')

SKATE_KEY=npm-token@dev-cluster
TOKEN=manage-packages
SCOPES='["write:organization"]'

get_token_resp=$(get_token)

if [ -n "${get_token_resp}" ]; then
	gum log -l warn -t kitchen "Token already exists - Deleting"
	delete_token
fi

generate_token_resp=$(generate_token)
gum log -l info -t kitchen -s "Token generated" "key" "${SKATE_KEY}"
skate set ${SKATE_KEY} <<<${generate_token_resp}
