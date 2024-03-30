#!/usr/bin/env bash

[ -z "${GITEA_HOST}" ] && echo "GITEA_HOST is required"
[ -z "${GITEA_USERNAME}" ] && echo "GITEA_USERNAME is required"
[ -z "${GITEA_PASSWORD}" ] && echo "GITEA_PASSWORD is required"

gitea_api="${GITEA_HOST}/api/v1"
curl_opts="-s"

#-------------------------------------------------------------------------------

function get_token() {
	[ -z "${TOKEN}" ] && echo "TOKEN is required" && exit 1

	resp=$(
		curl -XGET ${curl_opts} \
			"${gitea_api}/users/${username}/tokens/" \
			-H "accept: application/json" \
			-u "${username}:${password}"
	)

	jq ".[] | select(.name == \"${TOKEN}\")" <<<"${resp}"
}

function delete_token() {
	[ -z "${TOKEN}" ] && echo "TOKEN is required" && exit 1

	curl -XDELETE ${curl_opts} \
		"${gitea_api}/users/${username}/tokens/${TOKEN}" \
		-H "accept: application/json" \
		-u "${username}:${password}" ||
		true
}

function generate_token() {
	[ -z "${TOKEN}" ] && echo "TOKEN is required" && exit 1
	[ -z "${SCOPES}" ] && echo "SCOPES is required" && exit 1

	curl -XPOST ${curl_opts} \
		"${gitea_api}/users/${username}/tokens" \
		-H "accept: application/json" \
		-H "Content-Type: application/json" \
		-u "${username}:${password}" \
		-d @- <<EOF
{
  "name": "${TOKEN}",
  "scopes": ${SCOPES}
}
EOF
}

function generate_oauth_client() {
	[ -z "${CLIENT_NAME}" ] && echo "CLIENT_NAME is required" && exit 1
	[ -z "${REDIRECT_URI}" ] && echo "REDIRECT_URI is required" && exit 1

	curl -POST ${curl_opts} \
		"${gitea_api}/user/applications/oauth2" \
		-H "Content-Type: application/json" \
		-H "accept: application/json" \
		-u "${username}:${password}" \
		-d @- <<EOF
{
  "name": "${CLIENT_NAME}",
  "confidential_client": true,
  "redirect_uris": ["${REDIRECT_URI}"]
}
EOF
}

function check_if_repo_exists() {
	[ -z "${ORG}" ] && echo "ORG is required" && exit 1

	curl -XGET ${curl_opts} \
		"${gitea_api}/orgs/${ORG}/repos" \
		-H "accept: application/json" \
		-u "${username}:${password}"
}

function create_repo() {
	[ -z "${ORG}" ] && echo "ORG is requird" && exit 1
	[ -z "${REPO}" ] && echo "REPO is required" && exit 1

	curl -XPOST \
		"${gitea_api}/orgs/${ORG}/repos" \
		-H "Content-Type: application/json" \
		-H "accept: application/json" \
		-u "${username}:${password}" \
		-d @- <<EOF
{
  "name": "${REPO}",
  "default_branch": "main"
}
EOF
}

function check_if_org_exists() {
	[ -z "${ORG}" ] && echo "ORG is required" && exit 1

	curl -XGET ${curl_opts} \
		"${gitea_api}/orgs/${ORG}" \
		-H "accept: application/json" \
		-u "${username}:${password}"
}

function create_org() {
	[ -z "${ORG}" ] && echo "ORG is required" && exit 1

	curl -XPOST ${curl_opts} \
		"${gitea_api}/orgs" \
		-H "Content-Type: application/json" \
		-H "accept: application/json" \
		-u "${username}:${password}" \
		-d @- <<EOF
{
  "username": "${ORG}",
  "description": "${DESCRIPTION}"
}
EOF
}
