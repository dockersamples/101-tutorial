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
RUN rm -rf node_modules && \
    apk add zip && \
    zip -r /app.zip /app

# Configure the mkdocs.yml file for the correct language
FROM node:alpine AS mkdoc-config-builder
WORKDIR /app
RUN yarn init -y && yarn add yaml
COPY configure.js mkdocs* ./
ARG LANGUAGE
RUN node configure.js $LANGUAGE

# Dev-ready container - have to put configured file at root to prevent mount from overwriting it
FROM base AS dev
COPY --from=mkdoc-config-builder /app/mkdocs-configured.yml /
CMD ["mkdocs", "serve", "-a", "0.0.0.0:8000", "-f", "/mkdocs-configured.yml"]

# Do the actual build of the mkdocs site
FROM base AS build
COPY . .
COPY --from=mkdoc-config-builder /app/mkdocs-configured.yml ./mkdocs.yml
ARG LANGUAGE
RUN mv docs_${LANGUAGE} docs
RUN mkdocs build

# Extract the static content from the build
# and use a nginx image to serve the content
FROM nginx:alpine
COPY --from=app-zip-creator /app.zip /usr/share/nginx/html/assets/app.zip
COPY --from=build /app/site /usr/share/nginx/html
