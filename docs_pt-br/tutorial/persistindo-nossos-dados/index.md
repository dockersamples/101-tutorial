
Caso não tenha notado, nossa lista de tarefas está sendo apagada toda vez que rodamos
o container. Porque isso? Vamos mergulhar em como o container está trabalhando.

## O sistema de arquivos de um container

Quando um container roda, ele utiliza as várias camadas de uma imagem como seu sistema de arquivos.
Cada container também recebe o seu próprio "espaço de rascunho" para criar/atualizar/remover arquivos.
Quaisquer mudanças não serão vistas em outro container, _mesmo se_ eles estiverem usando a mesma imagem.


### Vendo isso na prática

Para ver isso em ação, iremos iniciar dois containers e criar um arquivo em cada.
O que você verá é que os arquivos criados em um container não estarão disponíveis no outro.

1. Inicie um container `ubuntu` que irá criar um arquivo chamado `/data.txt` com um número aleatório
entre 1 e 10000.

    ```bash
    docker run -d ubuntu bash -c "shuf -i 1-10000 -n 1 -o /data.txt && tail -f /dev/null"
    ```

    Caso esteja se perguntando sobre o comando, nós estamos iniciando um shell bash e invocando
    dois comandos (por isso o `&&`). A primeira parte pega um número aleatório e escreve ele em `/data.txt`.
    O segundo comando está simplesmente "olhando" o arquivo para manter o container rodando.

1. Para validar, podemos ver a saída `exec`utando dentro do container. Para fazer isso, você precisa pegar o ID do container (use `docker ps` para pegá-lo).

    ```bash
    docker exec <container-id> cat /data.txt
    ```

    Você deve ver um número aleatório!

1. Agora, vamos iniciar outro container `ubuntu` (a mesma imagem) e veremos que não temos o mesmo arquivo.

    ```bash
    docker run -it ubuntu ls /
    ```

    E olhe! Não há qualquer arquivo `data.txt` lá! Isso acontece porque ele foi escrito no espaço de rascunho apenas do primeiro container.

1. Vá em frente e remova o primeiro container usando o comando `docker rm -f`.


## Volumes de container

Com o experimento anterior, vimos que cada container é efetivamente somente leitura. Enquanto containers podem
criar, atualizar e apagar arquivos, estas mudanças são perdidas quando o container é removido e são isoladas naquele container.
Com volumes nós podemos mudar isso.

[Volumes](https://docs.docker.com/storage/volumes/) provêem a habilidade de conectar caminhos específicos do sistema de arquivos
do container de volta para a máquina hospedeira (host). Se um diretório no container é montado, mudanças naquele diretório também são vistas no host. Se montarmos aquele mesmo diretório ao reiniciar um container, veremos os mesmos aquivos.

Há dois tipos principais de volumes. Eventualmente usaremos ambos, mas vamos começar com **volumes nomeados**.



## Persistindo nossos dados de tarefas

Por padrão, o aplicativo de tarefas grava seus dados em um [Banco de dados SQLite](https://www.sqlite.org/index.html) em
`/etc/todos/todo.db`. Se você não está familizarizado com SQLite, não se preocupe! É simplesmente um banco de dados relacional
no qual todos os dados são gravados em um único arquivo. Apesar de que isso não é o melhor para aplicações de grande escala,
funciona muito bem para pequenas demos. Nós vamos falar sobre como mudar isto para uma engine de banco dados real depois.

Com o banco de dados sendo um único arquivo, se persistirmos este arquivo no host e tornarmos ele disponível para o próximo contêiner,
ele deve conseguir continuar de onde o anterior parou. Ao criar um volume e anexar (geralmente chamado "montar") ele ao diretório que 
os dados estão armazenados, nós conseguimos persistir os dados. Como o nosso container escreve no arquivo `todo.db`, ele será persistido
para o host no volume.

Como mencionado, nós vamos usar um **volume nomeado**. Pense em um volume nomeado simplesmente como um bucket de dados.
O Docker irá manter a localizalização física no disco e você só precisa lembrar o nome do volume.
Cada vez que você usar o volume, o Docker irá garantir que os dados corretos sejam providos.

1. Crie um volume usando o comando `docker volume create`.

    ```bash
    docker volume create todo-db
    ```

1. Inicie o container de tarefas, mas adicione a flag `-v` para especificar uma montagem de volume. Vamos usar o volume nomeado
   montá-lo em `/etc/todos/`, que irá capturar todos os arquivos criados neste caminho.

    ```bash
    docker run -dp 3000:3000 -v todo-db:/etc/todos docker-101
    ```

1. Assim que o container iniciar, abra o aplicativo e adicione alguns itens à sua lista de tarefas.

    ![Itens adicionar à lista de tarefas.](items-added.png){: style="width: 55%; " }
    {: .text-center }

1. Remova o container do aplicativo de tarefas. Use `docker ps` para pegar o ID e então `docker rm -f <id>` para removê-lo.

1. Inicie um container novo usando o mesmo comando acima.

1. Abra o aplicativo. Você deve ver seus itens ainda na sua lista!

1. Vá em frente e remova o container quando tiver terminado de checar a sua lista.

\o/! Você agora aprendeu como persistir dados!

!!! info "Dica"
    Apesar de volumes nomeados e volumes montados diretamente no host (vamos falar delas em um minuto) serem os 2 tipos principais de volumes
    suportados em uma instalação padrão da Docker engine, há muito mais plugins de driver de volume disponíveis para suportar
    NFS, SFTP, NetApp e mais! Isto será especialmente importante quando você começar a rodar containers em múltiplos hosts em
    um ambiente clusterizado com Swarm, Kubernetes, etc.


## Mergulhando no nosso Volume

Muitas pessoas frequentemente perguntam "Onde o Docker _realmente_ guarda meus dados quando eu uso um volume nomeado?". Se você 
quiser saber, pode usar o comando `docker volume inspect`.

```bash
docker volume inspect todo-db
[
    {
        "CreatedAt": "2019-09-26T02:18:36Z",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/todo-db/_data",
        "Name": "todo-db",
        "Options": {},
        "Scope": "local"
    }
]
```

O `Mountpoint` é a localização real no disco onde os dados estão armazenados. Note que na maioria das máquinas, você precisará de acesso
como root para acessar este diretório no host. Mas, é onde está!


## Recapitulando

Neste ponto temos uma aplicação funcionando que pode sobreviver à reinicializações! Podemos agora mostrá-la aos nossos investidores e torcer que eles consigam entender a nossa visão!

Porém, nós vimos antes que reconstruir imagens para cada mudança toma um pouco de tempo. Tem de haver uma forma melhor de fazer mudanças, certo? Com os pontos de montagens (que nós comentamos antes), há uma forma melhor! Vamos dar uma olhada nisso agora!
