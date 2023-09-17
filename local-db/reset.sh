#!/bin/bash
cd local-db || exit -1
echo "Running in $(pwd)"

project_id="plena_bot_local_db"

set -x

docker-compose -p $project_id down
rm -rf data
