# Docker 101 Tutorial

This tutorial has been written with the intent of helping folks get up and running
with containers. While not going too much into depth, it covers the following topics:

- Running your first container
- Building containers
- Learning what containers are running and removing them
- Using volumes to persist data
- Using bind mounts to support development
- Using container networking to support multi-container applications
- Using Docker Compose to simplify the definition and sharing of applications
- Using image layer caching to speed up builds and reduce push/pull size
- Using multi-stage builds to separate build-time and runtime dependencies

## Getting Started

If you wish to run the tutorial, you can use the following command:

```bash
docker run -dp 80:80 dockersamples/101-tutorial
```

Once it has started, you can open your browser to [http://localhost](http://localhost) or
port 80 if running on Play-with-Docker.


## Development

This project has a `docker-compose.yml` file, which will start the mkdocs application on your
local machine and help you see changes instantly.

```bash
docker-compose up
```

By default, the dev container will use the English version of the tutorial. If you wish to work on
a different version, modify the `services.docs.build.args.LANGUAGE` value to the language you want
to work in. Note that the build will fail if the steps below (for new languages) haven't been
completed yet.


## Contributing

If you find typos or other issues with the tutorial, feel free to create a PR and suggest fixes!

If you have ideas on how to make the tutorial better or new content, please open an issue first 
before working on your idea. While we love input, we want to keep the tutorial is scoped to new-comers.
As such, we may reject ideas for more advanced requests and don't want you to lose any work you might
have done. So, ask first and we'll gladly hear your thoughts!


### Translating the Tutorial

If you wish to translate the tutorial into another language, you need to do the following:

1. Copy the `docs_en` directory and rename it as `docs_[your-language-code]`.
1. Translate each of the directories.
1. Translate all *.md files
1. In the `mkdocs-config.json`, add a key for `your-language-code` and fill in the
   remaining pieces to configure the mkdocs build.
1. To test everything out, you can run the `build.sh` script, which will verify the config file,
   as well as build all languages.
