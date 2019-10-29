---
next_page: app.md
---

## El comando que acaba de ejecutar

Felicitaciones! Ha iniciado el contenedor para este tutorial!
Primero vamos a explicar el comando que acabas de ejecutar. Por si lo olvidaste, aquí está el comando:

```cli
docker run -d -p 80:80 dockersamples/101-tutorial
```

Notarás que se están usando algunas banderas. Aquí hay más información sobre ellos:

- `-d` - ejecuta el contenedor en modo independiente (tarea de fondo o segundo plano).
- `-p 80:80` - asigna el puerto 80 del host al puerto 80 del contenedor
- `dockersamples/101-tutorial` - la imagen a utilizar

!!! info "Consejo"
    Puede combinar banderas de un solo carácter para acortar el comando completo.
    Por ejemplo, el comando anterior podría escribirse como:
    ```
    docker run -dp 80:80 dockersamples/101-tutorial
    ```

## ¿Qué es un contenedor?

Ahora que ha ejecutado un contenedor, ¿qué es un contenedor? En pocas palabras, un contenedor es simplemente otro proceso en su máquina que ha sido aislado de todos los demás procesos en la máquina anfitriona (máquina host). Ese aislamiento aprovecha [namespaces del kernel y cgroups](https://medium.com/@saschagrunert/demystifying-containers-part-i-kernel-space-2c53d6979504), características que han estado en Linux durante mucho tiempo. Docker ha trabajado para que estas capacidades sean accesibles y fáciles de usar.

!!! info "Creación de contenedores a partir de Scratch"
    Si quieres ver cómo se construyen los contenedores desde cero, Liz Rice de Aqua Security tiene una fantástica charla en la que crea un contenedor desde cero en Go. Aunque ella hace un simple contenedor, esta charla no entra en pronfundidad sobre el manejo de red, construcción de imágenes para el sistema de archivos, y más. Pero, da una _fantástica_ inmersión profunda en cómo están funcionando las cosas.

    <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/8fi7uSYlOdc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## ¿Qué es una imagen de contenedor?

Cuando se ejecuta un contenedor, utiliza un sistema de archivos aislado. Este sistema de archivos personalizado es proporcionado por una **imagen del contenedor**. Dado que la imagen contiene el sistema de archivos del contenedor, debe contener todo lo necesario para ejecutar una aplicación: todas las dependencias, configuración, scripts, binarios, etc. La imagen también contiene otra configuración para el contenedor, como variables de entorno, un comando predeterminado para ejecutar y otros metadatos.

Más adelante nos adentraremos más en las imágenes, cubriendo temas como las capas, las mejores prácticas y mucho más.

!!! info
    Si está familiarizado con `chroot`, piense en un contenedor como una versión extendida de `chroot`. El sistema de archivos simplemente viene de la imagen. Pero, un contenedor añade un aislamiento adicional que no está disponible cuando se usa simplemente chroot.

