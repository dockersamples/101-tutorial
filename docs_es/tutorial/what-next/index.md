
Aunque hemos terminado con nuestro taller, todavía hay mucho más que aprender acerca de los contenedores! No vamos a hacer una inmersión profunda aquí, pero aquí hay algunas otras áreas para ver a continuación!

## Orquestación de contenedores

El funcionamiento de los contenedores en la producción es difícil. Usted no quiere iniciar sesión en una máquina y simplemente ejecutar un `docker run` o `docker-composition up`. ¿Por qué no? Bueno, ¿qué pasa si los contenedores mueren? ¿Cómo se puede escalar a través de varias máquinas? La orquestación de contenedores resuelve este problema. Herramientas como Kubernetes, Swarm, Nomad y ECS ayudan a resolver este problema, todas estas herramientas lo hacen un poco diferente.

La idea general es que usted tiene "gestores" que reciben **estado esperado**. Este estado podría ser "Quiero ejecutar dos instancias de mi aplicación web y exponer el puerto 80." Los gestores entonces miran todas las máquinas en el cluster y delegan el trabajo a los nodos "trabajadores". Los gestores están atentos a los cambios (como la salida de un contenedor) y luego trabajan para hacer que el **estado real** refleje el estado esperado.


## Proyectos de la Cloud Native Computing Foundation

La CNCF es un proveedor neutral para varios proyectos de código abierto, incluyendo  Kubernetes, Prometheus,  Envoy, Linkerd, NATS, y más! Puede ver los [proyectos graduados e incubados aquí](https://www.cncf.io/projects/) y todo [lo relacionado a CNCF](https://landscape.cncf.io/). Hay un montón de proyectos para ayudar a resolver problemas de monitoreo, registro, seguridad, registros de imágenes, mensajería y más!

Por lo tanto, si es nuevo en el mundo de los contenedores y en el desarrollo de aplicaciones nativas de la nube, ¡bienvenido! Por favor, conéctese con la comunidad, haga preguntas y siga aprendiendo! Estamos emocionados de tenerte!
