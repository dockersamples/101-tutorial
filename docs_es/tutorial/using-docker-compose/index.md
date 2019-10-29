
[Docker Compose](https://docs.docker.com/compose/) es una herramienta que fue desarrollada para ayudar a definir y compartir aplicaciones multi-contenedor. Con Compose, podemos crear un archivo YAML para definir los servicios y con un solo comando, podemos levantar o destruir todo. 

La _gran_ ventaja de usar Compose es que puede definir su pila de aplicaciones en un archivo, mantenerla en la raíz de su repositorio de proyectos (ahora está controlado por versiones), y permitir fácilmente que otra persona contribuya a su proyecto.  Alguien sólo tendría que clonar tu repositorio e iniciar la aplicación de composición. De hecho, es posible que veas bastantes proyectos en GitHub/GitLab haciendo exactamente esto ahora.

Entonces, ¿cómo empezamos?

## Instalación de Docker Compose

Si ha instalado Docker Desktop/Toolbox para Windows o Mac, Docker Compose se incluye con la instalación. Las instancias de Play-with-Docker ya tienen Docker Compose instalado. Si está en una máquina Linux, necesitará instalar Docker Compose usando 
[las siguientes instrucciones](https://docs.docker.com/compose/install/). 

Después de la instalación, debería poder ejecutar el siguiente comando y ver la información de la versión.

```bash
docker-compose version
```


## Creación de nuestro archivo Compose

1. En la raíz del proyecto de la aplicación, [crear un fichero](/pwd-tips.md#creating-files) llamado `docker-compose.yml`.

1. En el archivo compose, empezaremos por definir la versión del esquema. En la mayoría de los casos, es mejor utilizar la última versión soportada. Puedes ver el [Archivo compose de referencia](https://docs.docker.com/compose/compose-file/) para las versiones actuales del esquema y la matriz de compatibilidad.

    ```yaml
    version: "3.7"
    ```

1. A continuación, definiremos la lista de servicios (o contenedores) que queremos ejecutar como parte de nuestra aplicación.

    ```yaml hl_lines="3"
    version: "3.7"

    services:
    ```

Y ahora, empezaremos a migrar un servicio a la vez al archivo de composición.


## Definición del servicio de aplicaciones

Para recordar, este era el comando que estábamos usando para definir nuestro contenedor de aplicaciones.

```bash
docker run -dp 3000:3000 \
  -w /app -v $PWD:/app \
  --network todo-app \
  -e MYSQL_HOST=mysql \
  -e MYSQL_USER=root \
  -e MYSQL_PASSWORD=secret \
  -e MYSQL_DB=todos \
  node:10-alpine \
  sh -c "yarn install && yarn run dev"
```

1. Primero, definamos la entrada de servicio y la imagen del contenedor. Podemos elegir cualquier nombre para el servicio. El nombre se convertirá automáticamente en un alias de red, lo que será útil a la hora de definir nuestro servicio MySQL.

    ```yaml hl_lines="4 5"
    version: "3.7"

    services:
      app:
        image: node:10-alpine
    ```

1. Típicamente, verá el comando cerca de la definición de "image", aunque no hay ningún requisito en el proceso. Así que, sigamos adelante y pongamos eso en nuestro archivo.

    ```yaml hl_lines="6"
    version: "3.7"

    services:
      app:
        image: node:10-alpine
        command: sh -c "yarn install && yarn run dev"
    ```


1. Migramos la parte `-p 3000:3000` del comando definiendo `ports` para el servicio. Usaremos la opción [sintaxis corta](https://docs.docker.com/compose/compose-file/#short-syntax-1) aquí, pero también hay una más verbosa [sintaxis larga](https://docs.docker.com/compose/compose-file/#long-syntax-1)disponible también.

    ```yaml hl_lines="7 8"
    version: "3.7"

    services:
      app:
        image: node:10-alpine
        command: sh -c "yarn install && yarn run dev"
        ports:
          - 3000:3000
    ```

1. A continuación, migraremos el directorio de trabajo (`-w /app`) y el mapeo de volumen (`-v $PWD:/app`) usando las definiciones `working_dir` y `volumes`. Volumes también tiene una [sintaxis corta](https://docs.docker.com/compose/compose-file/#short-syntax-3) y [sintaxis larga](https://docs.docker.com/compose/compose-file/#long-syntax-3).

    Una de las ventajas de las definiciones de volumen de Docker Compose es que podemos utilizar rutas relativas del directorio actual.

    ```yaml hl_lines="9 10 11"
    version: "3.7"

    services:
      app:
        image: node:10-alpine
        command: sh -c "yarn install && yarn run dev"
        ports:
          - 3000:3000
        working_dir: /app
        volumes:
          - ./:/app
    ```

1. Finalmente, necesitamos migrar las definiciones de las variables de entorno utilizando la clave `environment`.

    ```yaml hl_lines="12 13 14 15 16"
    version: "3.7"

    services:
      app:
        image: node:10-alpine
        command: sh -c "yarn install && yarn run dev"
        ports:
          - 3000:3000
        working_dir: /app
        volumes:
          - ./:/app
        environment:
          MYSQL_HOST: mysql
          MYSQL_USER: root
          MYSQL_PASSWORD: secret
          MYSQL_DB: todos
    ```

  
### Definición del servicio MySQL

Ahora, es el momento de definir el servicio MySQL. El comando que usamos para ese contenedor fue el siguiente:

```bash
docker run -d \
  --network todo-app --network-alias mysql \
  -v todo-mysql-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=todos \
  mysql:5.7
```

1. Primero definiremos el nuevo servicio y lo llamaremos `mysql` para que obtenga automáticamente el alias de red. Vamos a seguir adelante y especificar la imagen a utilizar también.

    ```yaml hl_lines="6 7"
    version: "3.7"

    services:
      app:
        # La definición del servicio de aplicaciones
      mysql:
        image: mysql:5.7
    ```

1. A continuación, definiremos el mapeo de volumen. Cuando ejecutamos el contenedor con `docker run`, el volumen nombrado se creó automáticamente. Sin embargo, eso no sucede cuando se ejecuta con Compose. Necesitamos definir el volumen en la sección `volumes:`de nivel superior y luego especificar el punto de montaje en la configuración del servicio. Simplemente proporcionando el nombre del volumen, se utilizan las opciones predeterminadas. Sin embargo hay [muchas más opciones disponibles](https://docs.docker.com/compose/compose-file/#volume-configuration-reference).

    ```yaml hl_lines="8 9 10 11 12"
    version: "3.7"

    services:
      app:
        # The app service definition
      mysql:
        image: mysql:5.7
        volumes:
          - todo-mysql-data:/var/lib/mysql
    
    volumes:
      todo-mysql-data:
    ```

1. Por último, sólo tenemos que especificar las variables de entorno.

    ```yaml hl_lines="10 11 12"
    version: "3.7"

    services:
      app:
        # The app service definition
      mysql:
        image: mysql:5.7
        volumes:
          - todo-mysql-data:/var/lib/mysql
        environment: 
          MYSQL_ROOT_PASSWORD: secret
          MYSQL_DATABASE: todos
    
    volumes:
      todo-mysql-data:
    ```

En este punto, nuestro completo `docker-compose.yml` debería verse así:


```yaml
version: "3.7"

services:
  app:
    image: node:10-alpine
    command: sh -c "yarn install && yarn run dev"
    ports:
      - 3000:3000
    working_dir: /app
    volumes:
      - ./:/app
    environment:
      MYSQL_HOST: mysql
      MYSQL_USER: root
      MYSQL_PASSWORD: secret
      MYSQL_DB: todos

  mysql:
    image: mysql:5.7
    volumes:
      - todo-mysql-data:/var/lib/mysql
    environment: 
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: todos

volumes:
  todo-mysql-data:
```


## Ejecutando nuestra pila de aplicaciones

Ahora que tenemos nuestro archivo `docker-compose.yml`, podemos inciarlo!

1. Asegúrese de que ninguna otra copia de la aplicación/base-de-datos se esté ejecutando primero. (`docker ps` and `docker rm -f <ids>`).

1. Inicie la pila de aplicaciones utilizando el comando `docker-compose up`. Añadiremos la bandera `-d` para ejecutar todo en segundo plano.

    ```bash
    docker-compose up -d
    ```

    Cuando ejecutamos esto, deberíamos ver una salida como esta:

    ```plaintext
    Creating network "app_default" with the default driver
    Creating volume "app_todo-mysql-data" with default driver
    Creating app_app_1   ... done
    Creating app_mysql_1 ... done
    ```

    Usted notará que el volumen fue creado así como una red! De forma predeterminada, Docker Compose crea automáticamente una red específica para la pila de aplicaciones (por lo que no hemos definido ninguna en el archivo de composición).

1. Veamos los registros usando el comando `docker-compose logs -f`. Verá los registros de cada uno de los servicios intercalados en un único flujo. Esto es increíblemente útil cuando se quiere estar atento a los problemas relacionados con el tiempo. La bandera `-f` "sigue" al registro, así que le dará salida en vivo a medida que se genera.

    Si aún no lo has hecho, verás una salida que se parece a esta....

    ```plaintext
    mysql_1  | 2019-10-03T03:07:16.083639Z 0 [Note] mysqld: ready for connections.
    mysql_1  | Version: '5.7.27'  socket: '/var/run/mysqld/mysqld.sock'  port: 3306  MySQL Community Server (GPL)
    app_1    | Connected to mysql db at host mysql
    app_1    | Listening on port 3000
    ```

    El nombre del servicio se muestra al principio de la línea (a menudo coloreado) para ayudar a distinguir los mensajes. Si desea ver los registros de un servicio específico, puede añadir el nombre del servicio al final del comando logs (por ejemplo `docker-compose logs -f app`).

    !!! info "Consejo - Esperar a la base de datos antes de iniciar la aplicación"
        Cuando la aplicación se está iniciando, en realidad se sienta y espera a que MySQL esté listo antes de intentar conectarse a ella. Docker no tiene ningún soporte incorporado para esperar a que otro contenedor esté completamente listo, en funcionamiento y listo antes de iniciar otro contenedor. Para los proyectos basados en Node, puede utilizar la función de dependencia [wait-port](https://github.com/dwmkerr/wait-port). Existen proyectos similares para otros lenguajes de programación y frameworks.

1. En este punto, deberías poder abrir tu aplicación y verla funcionando. ¡Y oye! ¡Nos quedamos con una sola orden!


## Destruyéndolo todo

Cuando esté listo para derribarlo todo, simplemente corra `docker-compose down`. Los contenedores se detendrán y se eliminará la red.

!!! warning "Eliminando Volúmenes"
    Por defecto, los volúmenes nombrados en su archivo de composición NO se eliminan cuando se ejecuta `docker-compose down`. Si desea eliminar los volúmenes, deberá añadir la bandera `--volumes`.

Una vez que se ha eliminado, puede cambiar a otro proyecto, ejecutar `docker-compose' y estar listo para contribuir a ese proyecto ¡No hay nada más sencillo que eso!


## Recapitulación

En esta sección, nos enteramos de Docker Compose y de cómo ayuda de forma espectacular a definir y compartir aplicaciones multiservicio. Creamos un archivo Compose traduciendo los comandos que estábamos usando al formato compose apropiado.

En este punto, estamos empezando a terminar el tutorial. Sin embargo, hay algunas buenas prácticas sobre la creación de imágenes que queremos cubrir, ya que hay un gran problema con el Dockerfile que hemos estado utilizando. ¡Echemos un vistazo!