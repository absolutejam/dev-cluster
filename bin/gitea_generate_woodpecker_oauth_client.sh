#!/usr/bin/env bash

root=$(git rev-parse --show-toplevel)
source "${root}/bin/gitea_lib.sh"

DOMAIN=dev-cluster.local
# API=https://${DOMAIN}/gitea/api/v1

CLIENT_NAME=woodpecker
REDIRECT_URI=https://woodpecker.dev-cluster.local/authorize

generate_oauth_client_resp=$(generate_oauth_client)

tee "${root}/secrets/woodpecker-oauth2-client.json" <<<"${generate_oauth_client_resp}"

# TOKEN=woodpecker-ci
# SCOPES='["write:organization"]'

# get_token_resp=$(get_token)
#
# if [ -n "${get_token_resp}" ]; then
# 	echo "Token already exists - Deleting"
# 	delete_token
# fi
#
# generate_token_resp=$(generate_token)
# tee "${root}/secrets/woodpecker-token.json" <<<"${generate_token_resp}"
