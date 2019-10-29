
Hasta este punto, hemos estado trabajando con aplicaciones de contenedores individuales. Pero, ahora queremos añadir MySQL a la pila de aplicaciones. A menudo se plantea la siguiente pregunta: "¿Dónde se ejecutará MySQL? ¿Instalarlo en el mismo contenedor o ejecutarlo por separado?" En general, **cada contenedor debe hacer una cosa y hacerlo bien.** Algunas razones:

- Es muy probable que tenga que escalar las API y los interfaces de usuario de forma diferente a las bases de datos.
- Los contenedores separados le permiten versionar y actualizar versiones de forma aislada.
- Si bien puede utilizar un contenedor para la base de datos localmente, es posible que desee utilizar un servicio gestionado para la base de datos en producción. Por esta razón no sería buena idea enviar su motor de base de datos con su aplicación.
- La ejecución de múltiples procesos requerirá un gestor de procesos (el contenedor sólo inicia un proceso), lo que añade complejidad al inicio/parada del contenedor.

Y hay más razones. Por lo tanto, actualizaremos nuestra aplicación para que funcione así:

![Todo App connected to MySQL container](multi-app-architecture.png)
{: .text-center }


## Redes de Contenedores

Recuerde que los contenedores, por defecto, se ejecutan de forma aislada y no saben nada sobre otros procesos o contenedores en la misma máquina. Entonces, ¿cómo permitimos que un contenedor hable con otro? La respuesta es **networking**. Ahora, usted no tiene que ser un ingeniero de redes (¡hurra!). Simplemente recuerde esta regla...

> Si dos contenedores están en la misma red, pueden hablar entre sí. Si no están en la misma red, no pueden.


## Inicio de MySQL

Hay dos maneras de poner un contenedor en una red: 1) Asignarlo al inicio o 2) conectar un contenedor existente.
Por ahora, primero crearemos la red y asignaremos el contenedor MySQL al inicio.

1. Crear la red

    ```bash
    docker network create todo-app
    ```

1. Inicie un contenedor MySQL y conéctelo a la red. También vamos a definir algunas variables de entorno que la base de datos utilizará para inicializar la base de datos (ver la sección "Variables de entorno" en la sección [MySQL Docker Hub listing](https://hub.docker.com/_/mysql/)).

    ```bash
    docker run -d \
        --network todo-app --network-alias mysql \
        -v todo-mysql-data:/var/lib/mysql \
        -e MYSQL_ROOT_PASSWORD=secret \
        -e MYSQL_DATABASE=todos \
        mysql:5.7
    ```

    También verás que especificamos la bandera `--network-alias`. Volveremos a eso en un momento.

    !!! info "Consejo"
        Notarás que estamos usando un volumen llamado `todo-mysql-data` aquí y lo estamos montando en `/var/lib/mysql`, que es donde MySQL almacena sus datos. Sin embargo, nunca ejecutamos un comando `docker volume create`. Docker reconoce que queremos usar un volumen con nombre y lo crea automáticamente para nosotros.

1. Para confirmar que tenemos la base de datos en funcionamiento, conéctese a la base de datos y verifique que se conecte.

    ```bash
    docker exec -it <mysql-container-id> mysql -p
    ```

    Cuando aparezca el mensaje de contraseña, escriba **secret**. En el intérprete de comandos MySQL, haga una lista de las bases de datos y verifique que vea la base de datos `todos`.

    ```cli
    mysql> SHOW DATABASES;
    ```

    Debería ver en la salida algo así:

    ```plaintext
    +--------------------+
    | Database           |
    +--------------------+
    | information_schema |
    | mysql              |
    | performance_schema |
    | sys                |
    | todos              |
    +--------------------+
    5 rows in set (0.00 sec)
    ```

    ¡Hurra! Tenemos nuestra base de datos de "todos" y está lista para que la utilicemos!


## Conectando a MySQL

Ahora que sabemos que MySQL está funcionando, ¡usémoslo! Pero, la pregunta es... ¿cómo? Si ejecutamos otro contenedor en la misma red, ¿cómo podemos encontrar el contenedor (recuerde que cada contenedor tiene su propia dirección IP)?

Para averiguarlo, vamos a hacer uso del contenedor[nicolaka/netshoot](https://github.com/nicolaka/netshoot),que incluye una gran cantidad de herramientas que son útiles para la resolución de problemas o la depuración de problemas de red.

1. Inicie un nuevo contenedor utilizando la imagen nicolaka/netshoot. Asegúrese de conectarlo a la misma red.

    ```bash
    docker run -it --network todo-app nicolaka/netshoot
    ```

1. Dentro del contenedor, vamos a usar el comando `dig`, que es una herramienta de DNS muy útil. Vamos a buscar la dirección IP del nombre de host `mysql`.

    ```bash
    dig mysql
    ```

    Y obtendrá una salida como ésta....

    ```text
    ; <<>> DiG 9.14.1 <<>> mysql
    ;; global options: +cmd
    ;; Got answer:
    ;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 32162
    ;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 0

    ;; QUESTION SECTION:
    ;mysql.				IN	A

    ;; ANSWER SECTION:
    mysql.			600	IN	A	172.23.0.2

    ;; Query time: 0 msec
    ;; SERVER: 127.0.0.11#53(127.0.0.11)
    ;; WHEN: Tue Oct 01 23:47:24 UTC 2019
    ;; MSG SIZE  rcvd: 44
    ```

    En "ANSWER SECTION", verá un registro `A` para `mysql` que se resuelve a `172.23.0.2` (es muy probable que su dirección IP tenga un valor diferente). Aunque `mysql` no suele ser un nombre de host válido, Docker fue capaz de resolverlo a la dirección IP del contenedor que tenía ese alias de red (¿recuerdas la bandera `--network-alias` que usamos antes?).

    Lo que esto significa es que.... nuestra aplicación sólo necesita conectarse a un host llamado `mysql` y hablará con la base de datos! No hay nada más sencillo que eso!


## Ejecutando nuestra aplicación con MySQL

La aplicación todo soporta la configuración de algunas variables de entorno para especificar la configuración de la conexión MySQL. Estas variables de entorno son:

- `MYSQL_HOST` - el nombre de host para el servidor MySQL en ejecución
- `MYSQL_USER` - el nombre de usuario que se utilizará para la conexión
- `MYSQL_PASSWORD` - la contraseña a utilizar para la conexión
- `MYSQL_DB` - la base de datos a utilizar una vez conectada

!!! warning Setting Connection Settings via Env Vars
    Mientras que el uso de env vars para establecer los ajustes de conexión es generalmente aceptable para el desarrollo, es **ALTAMENTE DESCARTADO** cuando se ejecutan aplicaciones en producción. Diogo Mónica, antiguo jefe de seguridad de Docker, [escribió una fantástica entrada en el blog](https://diogomonica.com/2017/03/27/why-you-shouldnt-use-env-variables-for-secret-data/) explicando lo antes mencionado. 
    
    Un mecanismo más seguro es utilizar el soporte secreto proporcionado por su estructura de orquestación de contenedores. En la mayoría de los casos, estos secretos se montan como archivos en el contenedor en ejecución. Verás muchas aplicaciones (incluyendo la imagen MySQL y la aplicación todo) que también soportan env vars con un sufijo `_FILE` para apuntar a un archivo que contiene el archivo. 
    
    Por ejemplo, si establece `MYSQL_PASSWORD_FILE` var, la aplicación utilizará el contenido del archivo referenciado como contraseña de conexión. Docker no hace nada para apoyar a estos equipos. Su aplicación necesitará saber como buscar la variable y obtener el contenido del archivo.


Con todo esto explicado, ¡empecemos nuestro contenedor dev-ready!

1. Especificaremos cada una de las variables de entorno anteriores y conectaremos el contenedor a nuestra red de aplicaciones.

    ```bash hl_lines="3 4 5 6 7"
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

1. Si miramos los registros del contenedor (`docker logs <container-id>`), veremos un mensaje indicando que está usando la base de datos mysql.

    ```plaintext hl_lines="7"
    # Previous log messages omitted
    $ nodemon src/index.js
    [nodemon] 1.19.2
    [nodemon] to restart at any time, enter `rs`
    [nodemon] watching dir(s): *.*
    [nodemon] starting `node src/index.js`
    Connected to mysql db at host mysql
    Listening on port 3000
    ```

1. Abre la aplicación en tu navegador y añade algunos elementos a tu lista de tareas.

1. Conéctese a la base de datos mysql y compruebe que los elementos se están escribiendo en la base de datos. Recuerde, la contraseña es **secret**.

    ```bash
    docker exec -ti <mysql-container-id> mysql -p todos
    ```

    And in the mysql shell, run the following:

    ```plaintext
    mysql> select * from todo_items;
    +--------------------------------------+--------------------+-----------+
    | id                                   | name               | completed |
    +--------------------------------------+--------------------+-----------+
    | c906ff08-60e6-44e6-8f49-ed56a0853e85 | Do amazing things! |         0 |
    | 2912a79e-8486-4bc3-a4c5-460793a575ab | Be awesome!        |         0 |
    +--------------------------------------+--------------------+-----------+
    ```

    Obviamente, su tabla se verá diferente porque tiene sus propios items. Entonces, ¡deberías verlos almacenados allí!


## Recapitulación

En este punto, tenemos una aplicación que ahora almacena sus datos en una base de datos externa que se ejecuta en un contenedor separado. Aprendimos un poco sobre redes de contenedores y vimos cómo se puede realizar la detección de servicios utilizando DNS.

Pero, hay una buena posibilidad de que se esté empezando a sentir un poco abrumado con todo lo que necesita hacer para iniciar esta aplicación. Tenemos que crear una red, iniciar contenedores, especificar todas las variables de entorno, exponer puertos, y mucho más! Eso es mucho para recordar y ciertamente está haciendo que las cosas sean más difíciles de pasar a otra persona.

En la siguiente sección, hablaremos sobre Docker Compose. Con Docker Compose, podemos compartir nuestras pilas de aplicaciones de una forma mucho más fácil y dejar que otros las giren con un único (y simple) comando!


