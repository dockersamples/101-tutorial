# Install the base requirements for the app.
# This stage is to support development.
FROM python:alpine AS base
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

# Create the zip download file
FROM node:alpine AS app-zip-creator
WORKDIR /app
COPY app .
RUN yarn install && \
    yarn run test && \
    rm -rf node_modules
RUN apk add zip && \
    zip -r /app.zip /app

# Configure the mkdocs.yml file for the correct language
FROM node:alpine AS mkdoc-config-builder
ARG LANGUAGE
WORKDIR /app
RUN yarn init -y && yarn add yaml
COPY configure.js mkdocs* ./
RUN node configure.js $LANGUAGE

# Do the actual build of the mkdocs site
FROM base AS build
ARG LANGUAGE
COPY . .
COPY --from=mkdoc-config-builder /app/mkdocs-configured.yml ./mkdocs.yml
RUN mv docs_${LANGUAGE} docs
RUN mkdocs build

# Extract the static content from the build
# and use a nginx image to serve the content
FROM nginx:alpine
COPY --from=app-zip-creator /app.zip /usr/share/nginx/html/assets/app.zip
COPY --from=build /app/site /usr/share/nginx/html