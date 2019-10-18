---
next_page: app.md
---

## El comando que acabas de ejecutar

¡Felicidades! ¡Has iniciado el contenedor para este tutorial¡
Primero explicaremos el comando que acabas de ejecutar. En caso de que lo hayas olvidado,
aquí esta el comando:

```cli
docker run -d -p 80:80 dockersamples/101-tutorial
```

Notarás que se utilizan algunos parametros. A continuación más información sobre estos:

- `-d` - ejecuta el contenedor en modo aislado (en segundo plano)
- `-p 80:80` - mapea el puerto 80 del host local hacia el puerto 80 en el contenedor
- `dockersamples/101-tutorial` - la imagen a utilizar

!!! info "Consejo Pro"
    Puedes combinar parametros de un solo caracter para reducir el tamaño del comando.
    Por ejemplo, el comando anterior se podria abreviar de la siguiente manera:
    ```
    docker run -dp 80:80 dockersamples/101-tutorial
    ```

## ¿Qué es un contenedor?

Ahora que has ejecutado un contenedor, ¿qué _es_ un contenedor? En pocas palabras, un contenedor es
simplemente otro proceso que corre en tu máquina y ha sido aislado del resto de procesos que corren en la máquina host. Ese aislamiento aprovecha [kernel namespaces y cgroups](https://medium.com/@saschagrunert/demystifying-containers-part-i-kernel-space-2c53d6979504), funcionalidades que han sido parte de Linux desde hace mucho tiempo. Docker ha trabajado para hacer estas características accesibles y fáciles de usar.

!!! info "Creando Contenedores desde Cero"
    Si tienes interés en ver como se contruyen los contenedores desde cero, Liz Rice de Aqua Security tiene una charla genial en la cual ella crea un contenedor desde cero utilizando Go. Si bien ella construye un contenedor simple utilizando imagenes para el sistema de archivos y más, la charla no involucra la creación de redes. Pero, da una inmersión _fantástica_ profunda en cómo funcionan las cosas.

    <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/8fi7uSYlOdc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## ¿Qué es una imagen de contenedor?

Cuando se corre un contenedor, este utiliza un sistema de archivos aislado. Este sistema personalizado es proporcionado por una **imagen de contenedor**. Dado que la imagen contiene el sistema de archivos del contenedor, este debe contener todo lo necesario para ejecutar la aplicación - todas las dependencias, configuración, scripts, binarios, etc. La imagen también contiene otra configuración para el contenedor, tal como variables de entorno, un comando por defecto para ejecutar y otros metadatos.


Más adelante profundizaremos en las imágenes, tomando en cuenta temas como capas, mejores prácticas y más.

!!! info
    Si estas familiarizado/a con `chroot`, piensa en un contenedor como una versión extendida de `chroot`. El sistema de archivos simplemente viene desde la imagen. Pero, un contenedor agrega aislamiento adicional no disponible mediante chroot.
