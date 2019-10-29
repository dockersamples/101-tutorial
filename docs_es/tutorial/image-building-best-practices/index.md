
## Capas de una imagen

¿Sabías que puedes ver lo que constituye una imagen? Usando el comando `docker image history`, puede ver el comando que se usó para crear cada capa dentro de una imagen.

1. Utilice el comando `docker image history` para ver las capas de la imagen `docker-101` que creó anteriormente en el tutorial.

    ```bash
    docker image history
    ```

    Debería obtener una salida que se parezca a esto (las fechas/identeficadores pueden ser diferentes).

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

    Cada una de las líneas representa una capa en la imagen. La pantalla muestra aquí la base en la parte inferior con la capa más reciente en la parte superior. Usando esto, también puede ver rápidamente el tamaño de cada capa, ayudando a diagnosticar imágenes grandes.

1. Notarás que varias de las líneas están truncadas. Si añades la bandera `--no-trunc`, obtendrás la salida completa (sí.... es curioso cómo usas una bandera truncada para obtener una salida no truncada, ¿eh?)

    ```bash
    docker image history --no-trunc docker-101
    ```


## Almacenamiento de Capas en Caché

Ahora que ha visto las capas en acción, hay una lección importante que aprender para ayudar a aumentar los tiempos de construcción de sus imágenes de contenedor.

> Una vez que una capa cambia, todas las capas posteriores tienen que ser recreadas también.

Veamos el Dockerfile que estábamos usando una vez más....

```dockerfile
FROM node:10-alpine
WORKDIR /app
COPY . .
RUN yarn install --production
CMD ["node", "/app/src/index.js"]
```

Volviendo a la salida del historial de la imagen, vemos que cada comando en el Dockerfile se convierte en una nueva capa de la imagen. Puede que recuerdes que cuando hicimos un cambio en la imagen, las dependencias del hilo tuvieron que ser reinstaladas. ¿Hay alguna manera de arreglar esto? No tiene mucho sentido enviar alrededor de las mismas dependencias cada vez que construimos, ¿verdad?

Para arreglar esto, necesitamos reestructurar nuestro Dockerfile para ayudar a soportar el almacenamiento en caché de las dependencias. Para aplicaciones basadas en Node, esas dependencias se definen en el archivo `package.json`. Entonces, ¿qué pasa si copiamos sólo ese archivo en primer lugar, instalamos las dependencias, y luego copiamos en todo lo demás? Entonces, sólo recreamos las dependencias de yarn si hubo un cambio en el `package.json`. ¿Tiene sentido?

1. Actualice el archivo Docker para copiar primero en `package.json`, instale las dependencias y luego copie todo lo demás.

    ```dockerfile hl_lines="3 4 5"
    FROM node:10-alpine
    WORKDIR /app
    COPY package.json yarn.lock ./
    RUN yarn install --production
    COPY . .
    CMD ["node", "/app/src/index.js"]
    ```

1. Construya una nueva imagen usando `docker build`.

    ```bash
    docker build -t docker-101 .
    ```

    Debería ver una salida como esta....

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

    Verás que todas las capas fueron reconstruidas. Perfectamente bien desde que cambiamos un poco el Dockerfile.

1. Ahora, haga un cambio en el archivo `src/static/index.html` (como cambiar el `<title>` para decir "La impresionante aplicación Todo").

1. Construya la imagen Docker ahora usando `docker build` de nuevo. Esta vez, el resultado debería ser un poco diferente.

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

    En primer lugar, usted debe notar que la construcción fue MUCHO más rápido! Y, verá que todos los pasos 1-4 tienen `Usar caché`. Así que, ¡hurra! Estamos usando la caché de construcción. Subiendo (push) esta imagen y descargando (pull) las actualizaciones debería ser mucho más rápido también. ¡Hurra!


## Construcción Multi-Stage

Aunque no vamos a profundizar demasiado en ello en este tutorial, las construcciones multi-stage son una herramienta increíblemente poderosa para ayudar a utilizar múltiples etapas para crear una imagen. Hay varias ventajas para ellos:

- Separar las dependencias de tiempo de construcción de las dependencias de tiempo de ejecución.
- Reduzca el tamaño total de la imagen enviando _solamente_ lo que su aplicación necesita para ejecutarse

### Ejemplo de Maven/Tomcat

Cuando se crean aplicaciones basadas en Java, se necesita un JDK para compilar el código fuente en código bytecode Java. Sin embargo, ese JDK no es necesario en la producción. Además, es posible que estés usando herramientas como Maven o Gradle para ayudar a construir la aplicación. Estos tampoco son necesarios en nuestra imagen final. Construir esta imagen usando Multi-stage puede ser de gran ayuda.

```dockerfile
FROM maven AS build
WORKDIR /app
COPY . .
RUN mvn package

FROM tomcat
COPY --from=build /app/target/file.war /usr/local/tomcat/webapps 
```

En este ejemplo, usamos una etapa (llamada `build`) para realizar la construcción real de Java usando Maven. En la segunda etapa (a partir de `FROM tomcat`), copiamos en archivos de la etapa `build`. La imagen final es sólo la última etapa que se está creando (que puede ser anulada usando la bandera ``--target`).


### Ejemplo de React

Cuando creamos aplicaciones React, necesitamos un entorno de Node para compilar el código JS (típicamente JSX), hojas de estilo SASS, y más en HTML estático, JS, y CSS. Si no estamos haciendo renderizado del lado del servidor, ni siquiera necesitamos un entorno de Node para nuestra aplicación en producción. ¿Por qué no enviar los recursos estáticos en un contenedor estático de nginx?

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

Aquí, estamos usando una imagen `node:10` para realizar la construcción (maximizando el almacenamiento en caché de capas) y luego copiando la salida en un contenedor nginx. Genial, ¿eh?


## Recapitulación

Al entender un poco sobre cómo están estructuradas las imágenes, podemos construirlas más rápido y enviar menos cambios. Las construcciones multietapa también nos ayudan a reducir el tamaño general de la imagen y a aumentar la seguridad del contenedor final al separar las dependencias de tiempo de construcción de las dependencias de tiempo de ejecución.

