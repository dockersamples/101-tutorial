
No restante deste tutorial, trabalharemos com um simples gerenciador de listas de tarefas 
que está sendo executado pelo Node. Se você não conhece o Node, não se preocupe! Nenhuma experiência real em JavaScript é necessária!

Nesse ponto, sua equipe de desenvolvimento é bem pequena e você está simplesmente
criando um aplicativo para provar seu MVP (produto mínimo viável). Você quer
mostrar como funciona e o que é capaz de fazer sem precisar
pensar em como isso funcionará para uma equipe grande, vários desenvolvedores, etc.

![Screenshot do gerenciador de lista de tarefas](todo-list-sample.png){: style="width:50%;" }
{ .text-center }

## Colocando nosso App no PWD

Antes de podermos executar a aplicação, precisamos inserir o código fonte da aplicação
no ambiente Play with Docker. Para projetos reais, você pode clonar o repositório. Mas
nesse caso você fará o upload de um arquivo ZIP.

1. [Faça o download do arquivo zip](/assets/app.zip) e faça o upload para o Play with Docker. Dica, 
   você pode arrastar e soltar o zip (ou qualquer outro arquivo) no tela do terminal do PWD

1. Extraia o conteúdo do arquivo zip no PWD.

    ```bash
    unzip app.zip
    ```

1. Mude seu diretório para a nova pasta 'app'

    ```bash
    cd app/
    ```

1. Nesse diretório você deve ver uma simples aplicação baseada em Node.

    ```bash
    ls
    package.json  spec          src           yarn.lock
    ```

## Criando a imagem do contêiner da aplicação

Para criar a imagem precisamos usar um `Dockerfile`. Um Dockerfile 
é simplesmente um script em texto de instruções que são usadas para 
criar a imagem do contêiner. Se você já criou Dockerfiles antes, poderá
veja algumas falhas no Dockerfile abaixo. Mas não se preocupe! Nós vamos examiná-los.

1. Crie um arquivo de nome Dockerfile com o seguinte conteúdo.

    ```dockerfile
    FROM node:10-alpine
    WORKDIR /app
    COPY . .
    RUN yarn install --production
    CMD ["node", "/app/src/index.js"]
    ```

1. Construa a imagem do contêiner usando o comando `docker build`.

    ```bash
    docker build -t docker-101 .
    ```

    Este comando usou o Dockerfile para criar uma nova imagem de contêiner. Você pode
    ter notado que muitas "camadas" foram baixadas. Isso ocorre porque definimos no Dockerfile
    que queríamos iniciar a partir da imagem `node: 10-alpine`. Mas como nós
    não tinhamos essa imagem em nossa máquina ela precisava ser baixada.

    Depois disso, copiamos a nossa aplicação e usamos `yarn` para instalar as dependências.
    A diretiva `CMD` especifica o comando padrão a ser executado ao iniciar um contêiner
    desta imagem.

## Iniciando um contêiner de aplicação

Agora que temos uma imagem, vamos executar a aplicação! Para fazer isso, usaremos o comando
`docker run` (lembra-se dele anteriormente?).

1. Inicie seu contêiner usando o comando `docker run`:

    ```bash
    docker run -dp 3000:3000 docker-101
    ```

    Lembra das opções `-d` e `-p`? Estamos executando o novo contêiner no modo "desanexado" (no
    background) e criando um mapeamento entre a porta 3000 do host e a porta 3000 do contêiner.

1. Abra a aplicação clicando no link "3000" que apareceu na parte superior da interface do PWD. Uma vez aberto,
    você deve ter uma lista de tarefas vazia!

    ![Lista de tarefas vazia](todo-list-empty.png){: style="width:450px;margin-top:20px;"}
    {: .text-center }

1. Vá em frente e adicione um ou dois itens e veja se ele funciona conforme o esperado. Você pode marcar itens como
    completo e remover itens.

Nesse ponto você tem em execução um gerenciador de lista de tarefas com poucos itens, tudo construído por você!
Agora vamos fazer algumas alterações e aprender sobre o gerenciamento de nossos contêineres.

## Recapitulando

Nesta seção, aprendemos o básico sobre a construção de uma imagem de contêiner e criamos um
Dockerfile para fazer isso. Depois que construímos uma imagem, iniciamos o contêiner e vimos a aplicação em execução!

Em seguida, faremos uma modificação e aprenderemos a atualizar nossa aplicação em execução
com uma nova imagem. Ao longo do caminho, aprenderemos alguns outros comandos úteis.
