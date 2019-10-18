#!/bin/bash

set -e

# Quick verify
echo "Verifying mkdocs config"
docker run --rm -tiv $PWD:/app -w /app node:alpine node verify.js

for language in `find . -type d -maxdepth 1 | grep docs | cut -d '_' -f 2`; do
  echo "Going to build image for $language"
  docker build --build-arg LANGUAGE=$language -t dockersamples/101-tutorial:$language .
done
