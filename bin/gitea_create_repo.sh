#!/usb/bin/env bash

root=$(git rev-parse --show-toplevel)

[ ! -d "resources" ] || [ ! -d "repos" ] &&
	echo "Is this script running in the right root directory? (${PWD})" &&
	exit 1

services_root="resources/services"
repos_root="repos"

[ -z "${SERVICE}" ] && echo "SERVICE is required" && exit 1

service_source="${service_repo}/${SERVICE}"
service_repo="${repos_root}/${SERVICE}"

[ ! -d "${service_source}" ] && echo "Service not found" && exit 1

# Check if service already exists and delete it if it does
if [ -d "${service_repo}" ]; then
	rm -rf "${service_repo}"
fi
