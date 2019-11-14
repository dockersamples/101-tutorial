
Ahora que hemos construido una imagen, ¡compartámosla! Para compartir imágenes Docker, debe utilizar un registro Docker. El registro por defecto es Docker Hub y es de donde vienen todas las imágenes que hemos usado.

## Crear un Repo

Para subir (push) una imagen, primero tenemos que crear un repositorio en Docker Hub.

1. Ir a [Docker Hub](https://hub.docker.com) e identifíquese si es necesario.

1. Haga clic en el botón **Crear Repositorio**.

1. Para el nombre del repositorio, use `101-todo-app`. Asegúrese de que la visibilidad sea "pública".

1. ¡Haga clic en el botón **Crear**!

Si miras en el lado derecho de la página, verás una sección llamada **Docker commands**. Esto da un comando de ejemplo que necesitará ejecutar para subir (push) su imagen a este repositorio.

![Comando Docker con ejemplo push](push-command.png){: style=width:75% }
{: .text-center }


## Subiendo nuestra imagen

1. De vuelta en su instancia de PWD, intente ejecutar el comando. Debería aparecer un error que se parezca a esto:

    ```plaintext
    $ docker push dockersamples/101-todo-app
    The push refers to repository [docker.io/dockersamples/101-todo-app]
    An image does not exist locally with the tag: dockersamples/101-todo-app
    ```

    ¿Por qué falló? El comando push estaba buscando una imagen llamada dockersamples/101-todo-app, pero no la encontró. Si ejecuta `docker image ls`, tampoco verá uno.

    Para arreglar esto, necesitamos "etiquetar" nuestra imagen, lo que básicamente significa darle otro nombre.

1. Inicie su sesión en Docker Hub con el comando `docker login -u TU-NOMBRE-DE-USUARIO`.

1. Utilice el comando `docker tag` para dar un nuevo nombre a la imagen `docker-101`. Asegúrate de cambiar "TU-NOMBRE-DE-USUARIO" por tu ID de Docker.

    ```bash
    docker tag docker-101 TU-NOMBRE-DE-USUARIO/101-todo-app
    ```

1. Ahora intente su comando para subir la imagen de nuevo. Si está copiando el valor de Docker Hub, puede omitir la parte de `tagname`, ya que no añadimos una etiqueta al nombre de la imagen.

    ```bash
    docker push TU-NOMBRE-DE-USUARIO/101-todo-app
    ```

## Ejecutar nuestra imagen en una nueva instancia

Ahora que nuestra imagen ha sido construida e introducida en un registro, ¡vamos a intentar ejecutar nuestra aplicación en una instancia que nunca ha visto este contenedor!

1. De vuelta en PWD, haga clic en **Añadir Nueva Instancia** para crear una nueva instancia.

1. En la nueva instancia, inicia tu nueva aplicación.

    ```bash
    docker run -dp 3000:3000 TU-NOMBRE-DE-USUARIO/101-todo-app
    ```

    Deberías ver que la imagen es descargada y ¡eventualmente puesta en marcha!

1. Haz clic en la insignia 3000 cuando aparezca y deberías ver la aplicación con tus modificaciones ¡Hurra!


## Recapitulación

En esta sección, aprendimos a compartir nuestras imágenes subiéndolas a un registro. Luego fuimos a una nueva instancia y pudimos ejecutar la nueva imagen. Esto es bastante común en los Pipelines de CI, donde el Pipeline creará la imagen y la subirá a un registro y entonces el entorno de producción podrá utilizar la última versión de la imagen.

Ahora que tenemos eso resuelto, volvamos a lo que notamos al final de la última sección. Como recordatorio, notamos que cuando reiniciamos la aplicación, perdimos todos los elementos de nuestra lista de tareas pendientes. Obviamente, esa no es una gran experiencia de usuario, ¡así que aprendamos cómo podemos conservar los datos en los reinicios!