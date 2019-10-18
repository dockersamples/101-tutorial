#!/bin/bash

set -e

# Quick verify of the mkdocs config
echo "Verifying mkdocs config"
docker run --rm -tiv $PWD:/app -w /app node:alpine node verify.js

# Validate tests are passing for the app
echo "Running tests for the app"
docker run --rm -tiv $PWD/app:/app -w /app node:alpine sh -c "yarn install && yarn test"

if [ $1 == "--push" ]; then
    WILL_PUSH=1
else
    WILL_PUSH=0
fi

# Build each language and, you know, multi-arch it!
for language in `find . -type d -maxdepth 1 | grep docs | cut -d '_' -f 2`; do
  echo "Going to build image for $language"

  docker buildx build \
      --platform linux/amd64,linux/arm64,linux/arm/v7,linux/arm/v6 \
      --build-arg LANGUAGE=$language \
      -t dockersamples/101-tutorial:$language \
      $( (( $WILL_PUSH == 1 )) && printf %s '--push' ) .
done

# Retag "en" as latest
docker buildx build \
      --platform linux/amd64,linux/arm64,linux/arm/v7,linux/arm/v6 \
      --build-arg LANGUAGE=en \
      -t dockersamples/101-tutorial:latest \
      $( (( $WILL_PUSH == 1 )) && printf %s '--push' ) .
