
No capítulo anterior nós falamos sobre e usamos um **volume nomeado** para persistir os dados no nosso banco de dados.
Volumes nomeados são ótimo se nós apenas precisamos guardar dados, já que não precisamos nos preocupar com _onde_ os dados são guardados.

Com **pontos de montagem** nós controlamos o local exato da montagem no host. Nós podemos usar isso para persistir dados,
mas geralmente ele é utilizado para prover dados adicionais dentro do container. Quando trabalhando com um aplicação, nós 
podemos utilizar um ponto de montagem para montar o nosso código fonte dentro do container e deixar ele ver as mudanças do código,
responder e nos deixar ver as mudanças na mesma hora.

Para aplicações baseadas em Node.js, [nodemon](https://npmjs.com/package/nodemon) é uma ótima ferramenta para cuidar por mudanças de
código e então reiniciar a aplicação. Há ferramentas equivalentes na maioria das linguagens e frameworks.

## Comparação rápida entre tipos de Volume

Pontos de montagem e volumes nomeados são os dois principais tipos de volumes que vem com a engine Docker. Porem, drivers de volume adicionais estão disponíveis para suportar outros casos de uso ([SFTP](https://github.com/vieux/docker-volume-sshfs), [Ceph](https://ceph.com/geen-categorie/getting-started-with-the-docker-rbd-volume-plugin/), [NetApp](https://netappdvp.readthedocs.io/en/stable/), [S3](https://github.com/elementar/docker-s3-volume), e mais).

|   | Volumes nomeados | Pontos de montagem |
| - | ------------- | ----------- |
| Caminho no host | Docker decide | Você controla |
| Exemplo de montagem (usando `-v`)| meu-volume:/usr/local/data | /caminho/para/os/dados:/usr/local/data |
| Popula o novo volume com conteúdo do container | Sim | Não |
| Suporta drivers de Volume | Sim | Não |


## Iniciando um Container em "Modo-Dev"

Para rodar nosso container com suporte a um workflow de desenvolvimento, faremos o seguinte:

- Montar nosso código fonte dentro do container
- Instalar todas dependências, incluindo as dependências "dev"
- Iniciar o nodemon para cuidar por mudanças no sistema de arquivos

Então, bora lá!

1. Garanta que você não tem nenhum dos containers `docker-101` rodando.

1. Rode o seguinte comando. Vamos explicar o que está acontecendo depois:

    ```bash
    docker run -dp 3000:3000 \
        -w /app -v $PWD:/app \
        node:10-alpine \
        sh -c "yarn install && yarn run dev"
    ```

    - `-dp 3000:3000` - mesma coisa de antes. Roda no modo desanexado (background) e cria um mapeamento de porta
    - `-w /app` - define o "diretório de trabalho" ou, o diretório onde de onde o comando será rodado
    - `node:10-alpine` - a imagem para usar. Note que é a imagem base para o nosso aplicativo no Dockerfile
    - `sh -c "yarn install && yarn run dev"` - o comando. Nós estamos iniciando um shell usando `sh` (alpine não tem `bash`) e
      rodando `yarn install` para instalar _todas_ dependências e então rodando `yarn run dev`. Se olhar no arquivo `package.json`,
      veremos que o script `dev` está iniciando o `nodemon`.

1. Você pode olhar os logs usando `docker logs -f <id do container>`. VOcê vai saber que está pronto quando ver isso...

    ```bash
    docker logs -f <container-id>
    $ nodemon src/index.js
    [nodemon] 1.19.2
    [nodemon] to restart at any time, enter `rs`
    [nodemon] watching dir(s): *.*
    [nodemon] starting `node src/index.js`
    Using sqlite database at /etc/todos/todo.db
    Listening on port 3000
    ```

    Quando terminar de olhar os logs, saia pressionando `Ctrl`+`C`.

1. Agora, vamos fazer a mudança no aplicativo. No arquivo `src/static/js/app.js` vamos mudar o botão "Add Item" para 
   simplesmente dizer "Add". Essa mudança será na linha 109

    ```diff
    -                         {submitting ? 'Adding...' : 'Add Item'}
    +                         {submitting ? 'Adding...' : 'Add'}
    ```

1. Apenas atualize a página (ou abra ela) e você verá a mudança refletida no browser quase imediatamente. Pode levar uns segundos
   para o servidor Node reiniciar, então se aparecer um erro, apenas atualize depois de alguns segundos.

    ![Screenshot do nome do botão Add atualizado](updated-add-button.png){: style="width:75%;"}
    {: .text-center }

1. Sinta-se livre para fazer quaisquer outras mudanças que você gostaria de fazer. Quando tiver terminado, pare o container e construa sua nova imagem usando `docker build -t docker-101 .`.


Usar pontos de montam é _muito_ comum para setups de desenvolvimento local. A vantagem é que a máquina dev não precisa ter
todas as ferramentas e ambientes de build instalados. Com apenas um `docker run`, o ambiente de desenvolvimento é puxado e fica pronto
para ser usado. Vamos falar sobre Docker Compose em um passo futuro, já que isso simplifica nossos comandos (nós já estamos usando várias flags).

## Recapitulando

Neste ponto, já podemos persistir nosso banco de dados e responder rapidamente às necessidades e demandas dos nossos investidores
e fundadores. \o/!
Mas, Adivinha? Recebemos grandes notícias!

**Seu projeto foi selecionado para desenvolvimento futuro!**

Para se preparar para produção, precisamos migrar nossa base de dados de SQLite para algo que possa escalar um pouco melhor.
Para simplicidade, vamos manter com uma base de dados relacional e mudar a nossa aplicação para usar MySQL. Mas, como devemos
rodar o MySQL? Como vamos fazer com que os containers falem entre si? Vamos falar sobre isso agora!
