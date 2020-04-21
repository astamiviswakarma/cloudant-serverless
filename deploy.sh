#!/usr/bin/env bash
# Deploy script for cloudant-serverless project.
#
# for local development run this
# $ CLOUDANT_URL="<cloudant-url>" CLOUDANT_DATABASE="<cloudant-database-name>" ./deploy.sh
#
[[ -z "$CLOUDANT_URL" ]] && { echo "Error: CLOUDANT_URL environment variable not set"; exit 1; }
[[ -z "$CLOUDANT_DATABASE" ]] && { echo "Error: CLOUDANT_DATABASE environment variable not set"; exit 1; }

if which wskdeploy >/dev/null; then
    wskdeploy -m manifest.yml --param "services.cloudant.url" "$CLOUDANT_URL" --param "services.cloudant.database" "$CLOUDANT_DATABASE"
else
    echo "wskdeploy not found on system path"
fi
