
## Image Layering

Did you know that you can look at what makes up an image? Using the `docker image history`
command, you can see the command that was used to create each layer within an image.

1. Use the `docker image history` command to see the layers in the `docker-101` image you
   created earlier in the tutorial.

    ```bash
    docker image history
    ```

    You should get output that looks something like this (dates/IDs may be different).

    ```plaintext
    IMAGE               CREATED             CREATED BY                                      SIZE                COMMENT
    a78a40cbf866        18 seconds ago      /bin/sh -c #(nop)  CMD ["node" "/app/src/ind…   0B                  
    f1d1808565d6        19 seconds ago      /bin/sh -c yarn install --production            85.4MB              
    a2c054d14948        36 seconds ago      /bin/sh -c #(nop) COPY dir:5dc710ad87c789593…   198kB               
    9577ae713121        37 seconds ago      /bin/sh -c #(nop) WORKDIR /app                  0B                  
    b95baba1cfdb        7 weeks ago         /bin/sh -c #(nop)  CMD ["node"]                 0B                  
    <missing>           7 weeks ago         /bin/sh -c #(nop)  ENTRYPOINT ["docker-entry…   0B                  
    <missing>           7 weeks ago         /bin/sh -c #(nop) COPY file:238737301d473041…   116B                
    <missing>           7 weeks ago         /bin/sh -c apk add --no-cache --virtual .bui…   5.5MB               
    <missing>           7 weeks ago         /bin/sh -c #(nop)  ENV YARN_VERSION=1.17.3      0B                  
    <missing>           7 weeks ago         /bin/sh -c addgroup -g 1000 node     && addu…   65.4MB              
    <missing>           7 weeks ago         /bin/sh -c #(nop)  ENV NODE_VERSION=10.16.3     0B                  
    <missing>           5 months ago        /bin/sh -c #(nop)  CMD ["/bin/sh"]              0B                  
    <missing>           5 months ago        /bin/sh -c #(nop) ADD file:a86aea1f3a7d68f6a…   5.53MB  
    ```

    Each of the lines represents a layer in the image. The display here shows the base at the bottom with
    the newest layer at the top. Using this, you can also quickly see the size of each layer, helping 
    diagnose large images.

1. You'll notice that several of the lines are truncated. If you add the `--no-trunc` flag, you'll get the
   full output (yes... funny how you use a truncated flag to get untruncated output, huh? :smile:)

    ```bash
    docker image history --no-trunc docker-101
    ```


## Layer Caching

Now that you've seen the layering in action, there's an important lesson to learn to help increase build
times for your container images.

> Once a layer changes, all downstream layers have to be recreated as well

Let's look at the Dockerfile we were using one more time...

```dockerfile
FROM node:10-alpine
WORKDIR /app
COPY . .
RUN yarn install --production
CMD ["node", "/app/src/index.js"]
```

Going back to the image history output, we see that each command in the Dockerfile becomes a new layer in the image.
You might remember that when we made a change to the image, the yarn dependencies had to be reinstalled. Is there a
way to fix this? It doesn't make much sense to ship around the same dependencies every time we build, right?

To fix this, we need to restructure our Dockerfile to help support the caching of the dependencies. For Node-based
applications, those dependencies are defined in the `package.json` file. So, what if we copied only that file in first,
install the dependencies, and _then_ copy in everything else? Then, we only recreate the yarn dependencies if there was
a change to the `package.json`. Make sense?

1. Update the Dockerfile to copy in the `package.json` first, install dependencies, and then copy everything else in.

    ```dockerfile hl_lines="3 4 5"
    FROM node:10-alpine
    WORKDIR /app
    COPY package.json yarn.lock ./
    RUN yarn install --production
    COPY . .
    CMD ["node", "/app/src/index.js"]
    ```

1. Build a new image using `docker build`.

    ```bash
    docker build -t docker-101 .
    ```

    You should see output like this...

    ```plaintext
    Sending build context to Docker daemon  219.1kB
    Step 1/6 : FROM node:10-alpine
    ---> b95baba1cfdb
    Step 2/6 : WORKDIR /app
    ---> Using cache
    ---> 9577ae713121
    Step 3/6 : COPY package* yarn.lock ./
    ---> bd5306f49fc8
    Step 4/6 : RUN yarn install --production
    ---> Running in d53a06c9e4c2
    yarn install v1.17.3
    [1/4] Resolving packages...
    [2/4] Fetching packages...
    info fsevents@1.2.9: The platform "linux" is incompatible with this module.
    info "fsevents@1.2.9" is an optional dependency and failed compatibility check. Excluding it from installation.
    [3/4] Linking dependencies...
    [4/4] Building fresh packages...
    Done in 10.89s.
    Removing intermediate container d53a06c9e4c2
    ---> 4e68fbc2d704
    Step 5/6 : COPY . .
    ---> a239a11f68d8
    Step 6/6 : CMD ["node", "/app/src/index.js"]
    ---> Running in 49999f68df8f
    Removing intermediate container 49999f68df8f
    ---> e709c03bc597
    Successfully built e709c03bc597
    Successfully tagged docker-101:latest
    ```

    You'll see that all layers were rebuilt. Perfectly fine since we changed the Dockerfile quite a bit.

1. Now, make a change to the `src/static/index.html` file (like change the `<title>` to say "The Awesome Todo App").

1. Build the Docker image now using `docker build` again. This time, your output should look a little different.

    ```plaintext hl_lines="5 8 11"
    Sending build context to Docker daemon  219.1kB
    Step 1/6 : FROM node:10-alpine
    ---> b95baba1cfdb
    Step 2/6 : WORKDIR /app
    ---> Using cache
    ---> 9577ae713121
    Step 3/6 : COPY package* yarn.lock ./
    ---> Using cache
    ---> bd5306f49fc8
    Step 4/6 : RUN yarn install --production
    ---> Using cache
    ---> 4e68fbc2d704
    Step 5/6 : COPY . .
    ---> cccde25a3d9a
    Step 6/6 : CMD ["node", "/app/src/index.js"]
    ---> Running in 2be75662c150
    Removing intermediate container 2be75662c150
    ---> 458e5c6f080c
    Successfully built 458e5c6f080c
    Successfully tagged docker-101:latest
    ```

    First off, you should notice that the build was MUCH faster! And, you'll see that steps 1-4 all have
    `Using cache`. So, hooray! We're using the build cache. Pushing and pulling this image and updates to it
    will be much faster as well. Hooray!


## Multi-Stage Builds

While we're not going to dive into it too much in this tutorial, multi-stage builds are an incredibly powerful
tool to help use multiple stages to create an image. There are several advantages for them:

- Separate build-time dependencies from runtime dependencies
- Reduce overall image size by shipping _only_ what your app needs to run

### Maven/Tomcat Example

When building Java-based applications, a JDK is needed to compile the source code to Java bytecode. However,
that JDK isn't needed in production. Also, you might be using tools like Maven or Gradle to help build the app.
Those also aren't needed in our final image. Multi-stage builds help.

```dockerfile
FROM maven AS build
WORKDIR /app
COPY . .
RUN mvn package

FROM tomcat
COPY --from=build /app/target/file.war /usr/local/tomcat/webapps 
```

In this example, we use one stage (called `build`) to perform the actual Java build using Maven. In the second
stage (starting at `FROM tomcat`), we copy in files from the `build` stage. The final image is only the last stage
being created (which can be overridden using the `--target` flag).


### React Example

When building React applications, we need a Node environment to compile the JS code (typically JSX), SASS stylesheets,
and more into static HTML, JS, and CSS. If we aren't doing server-side rendering, we don't even need a Node environment
for our production build. Why not ship the static resources in a static nginx container?

```dockerfile
FROM node:10 AS build
WORKDIR /app
COPY package* yarn.lock ./
RUN yarn install
COPY public ./public
COPY src ./src
RUN yarn run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
```

Here, we are using a `node:10` image to perform the build (maximizing layer caching) and then copying the output
into an nginx container. Cool, huh?


## Recap

By understanding a little bit about how images are structured, we can build images faster and ship fewer changes.
Multi-stage builds also help us reduce overall image size and increase final container security by separating
build-time dependencies from runtime dependencies.

