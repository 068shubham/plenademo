#! /bin/bash
echo "Running in $(pwd)"
set -x

rm -rf node_modules
rm -rf dist

npm i
npm run build
