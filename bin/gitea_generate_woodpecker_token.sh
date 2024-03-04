#!/usr/bin/env bash

root=$(git rev-parse --show-toplevel)
source "${root}/bin/gitea_lib.sh"

DOMAIN=dev-cluster.local
API=https://${DOMAIN}/gitea/api/v1
WOODPECKER=https://${DOMAIN}/woodpecker
OAUTH_AUTHORIZE_URL=${WOODPECKER}/authorize

TOKEN=woodpecker-ci
SCOPES='["write:organization"]'

if [ -n get_token ]; then
	echo "Token already exists - Deleting"
	delete_token
fi

token_resp=$(generate_token)
tee "${root}/secrets/woodpecker-token.json" <<<"${token_resp}"
