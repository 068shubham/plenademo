#!/bin/bash
cd local-db || exit -1
echo "Running in $(pwd)"

project_id="plena_bot_local_db"

set -x

docker-compose -p $project_id down
docker-compose -p $project_id up -d
container_id=$(docker ps | grep $project_id | cut -d' ' -f1)

set +x

echo "Wait for mysql DB container $container_id to accept connections"
