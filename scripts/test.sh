#! /bin/bash
username=$1
password=$2

if [[ -z "$username" ]]; then
    echo "username should be first argument"
    exit -1
fi
if [[ -z "$password" ]]; then
    echo "password should be first argument"
    exit -1
fi

echo "Running in $(pwd)"
set -x

node ./dist/index.js $username $password
