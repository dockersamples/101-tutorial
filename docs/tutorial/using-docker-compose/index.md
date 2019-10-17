
[Docker Compose](https://docs.docker.com/compose/) é uma ferramenta que foi desenvolvida para ajudar a definir e
compartilhar aplicações com vários contêineres. Com o Compose, podemos criar um arquivo YAML para definir os serviços
e com um único comando, pode executar tudo ou derrubar tudo.

A _grande_ vantagem de usar o Compose é que você pode definir a stack da sua aplicação em um arquivo, mantê-la na raiz do
repositório do seu projeto (agora com controle de versão) e permita que outra pessoa contribua com facilidade para o seu projeto.
Alguém só precisa clonar seu repositório e iniciar o Compose. De fato, você pode ver alguns projetos
no GitHub / GitLab fazendo exatamente isso agora.

Então, como começamos?

## Instalando o Docker Compose

Se você instalou o Docker Desktop / Toolbox no Windows ou Mac, o Docker Compose está incluído no
instalação. As instâncias do Play-with-Docker já têm o Docker Compose instalado também. Se você estiver
uma máquina Linux, você precisará instalar o Docker Compose usando
[estas instruções aqui](https://docs.docker.com/compose/install/).

Após a instalação, você poderá executar o seguinte e ver as informações da versão.

```bash
docker-compose version
```

## Criando nosso arquivo Compose

1. Na raiz do projeto da aplicação, [crie um arquivo](/pwd-tips.md#creating-files) chamado `docker-compose.yml`.

1. No arquivo compose, começaremos definindo a versão do esquema. Na maioria dos casos, é melhor usar
  a versão mais recente suportada. Você pode consultar a 
  [Referência do arquivo compose](https://docs.docker.com/compose/compose-file/)
  para as versões atuais do esquema e a matriz de compatibilidade.

    ```yaml
    version: "3.7"
    ```

1. Em seguida, definiremos a lista de serviços (ou contêineres) que queremos executar como parte de nosso aplicativo.

    ```yaml hl_lines="3"
    version: "3.7"

    services:
    ```

E agora, começaremos a migrar um serviço de cada vez para o arquivo compose.

## Definindo o serviço da aplicação

Para lembrar, este era o comando que estávamos usando para definir nosso contêiner de aplicativos.

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

1. Primeiro, vamos definir o serviço de entrada e a imagem do contêiner. Podemos escolher qualquer nome para o serviço.
  O nome se tornará automaticamente um alias de rede, o que será útil ao definir nosso serviço MySQL.

    ```yaml hl_lines="4 5"
    version: "3.7"

    services:
      app:
        image: node:10-alpine
    ```

1. Normalmente, você verá o comando próximo à definição da "imagem", embora não exista nenhum requisito com relação a ordem.
    Então, vamos em frente e mova isso para o nosso arquivo.

    ```yaml hl_lines="6"
    version: "3.7"

    services:
      app:
        image: node:10-alpine
        command: sh -c "yarn install && yarn run dev"
    ```

1. Vamos migrar a parte `-p 3000: 3000` do comando, definindo `ports` para o serviço. Nós vamos usar a
  [sintaxe curta](https://docs.docker.com/compose/compose-file/#short-syntax-1) aqui, mas também há uma descrição mais detalhada
  [long syntax](https://docs.docker.com/compose/compose-file/#long-syntax-1) também disponível..

    ```yaml hl_lines="7 8"
    version: "3.7"

    services:
      app:
        image: node:10-alpine
        command: sh -c "yarn install && yarn run dev"
        ports:
          - 3000:3000
    ```

1. Em seguida, migraremos o diretório ativo (`-w / app`) e o mapeamento de volume (` -v $ PWD: / app`) usando
  as definições `working_dir` e` volumes`. Os volumes também possuem [sintaxe curta](https://docs.docker.com/compose/compose-file/#short-syntax-3) e [sintaxe longa](https://docs.docker.com/compose/compose-file/#long-syntax-3).

     Uma vantagem das definições de volume do Docker Compose é que podemos usar caminhos relativos do diretório atual.

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

1. Finalmente, precisamos migrar as definições de variáveis de ambiente usando a chave `environment`.

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

### Definindo o serviço MySQL

Agora, é hora de definir o serviço MySQL. O comando que usamos para esse contêiner foi o seguinte:

```bash
docker run -d \
  --network todo-app --network-alias mysql \
  -v todo-mysql-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=todos \
  mysql:5.7
```

1. Primeiro definiremos o novo serviço e o chamaremos de `mysql` para que ele obtenha automaticamente o alias da rede. Bem
  vá em frente e especifique a imagem a ser usada também.

    ```yaml hl_lines="6 7"
    version: "3.7"

    services:
      app:
        # The app service definition
      mysql:
        image: mysql:5.7
    ```

1. A seguir, definiremos o mapeamento de volume. Quando executamos o contêiner com `docker run`, o volume nomeado foi criado
  automaticamente. No entanto, isso não acontece ao executar com o Compose. Precisamos definir o volume no nível superior na seção
  `volumes:` e especifique o ponto de montagem na configuração do serviço simplesmente fornecendo apenas o nome do volume.
  As opções padrão são usadas. Existem [muito mais opções disponíveis](https://docs.docker.com/compose/compose-file/#volume-configuration-reference).

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

1. Finalmente, precisamos apenas especificar as variáveis de ambiente.

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

Neste ponto, nosso `docker-compose.yml` completo deve ficar assim:

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

## Executando nossa stack de aplicações

Agora que temos o nosso arquivo `docker-compose.yml`, podemos iniciá-lo!

1. Certifique-se que nenhuma outra cópia do app / db está sendo executada primeiro (`docker ps` and `docker rm -f <ids>`).

1. Inicie a stack de aplicações usando o comando `docker-compose up`. Adicionaremos a opção `-d` para executar tudo no
    em background.

    ```bash
    docker-compose up -d
    ```

    Quando executamos isso, devemos ver resultados como este:

    ```plaintext
    Creating network "app_default" with the default driver
    Creating volume "app_todo-mysql-data" with default driver
    Creating app_app_1   ... done
    Creating app_mysql_1 ... done
    ```

    Você notará que o volume foi criado e também uma rede! Por padrão, o Docker Compose cria automaticamente um
    rede especificamente para a stack de aplicações (é por isso que não definimos uma no arquivo do Compose).

1. Vejamos os logs usando o comando `docker-compose logs -f`. Você verá os logs de cada um dos serviços intercalados
    em um único fluxo. Isso é incrivelmente útil quando você deseja observar problemas de ordem temporal. A opção `-f` "segue" o
    log, portanto, o compose fornecerá a saída ao vivo conforme ele é gerada.

    Se ainda não o fez, verá resultados parecidos com este ...

    ```plaintext
    mysql_1  | 2019-10-03T03:07:16.083639Z 0 [Note] mysqld: ready for connections.
    mysql_1  | Version: '5.7.27'  socket: '/var/run/mysqld/mysqld.sock'  port: 3306  MySQL Community Server (GPL)
    app_1    | Connected to mysql db at host mysql
    app_1    | Listening on port 3000
    ```

    O nome do serviço é exibido no início da linha (geralmente colorido) para ajudar a distinguir as mensagens. Se você quiser
    visualizar os logs de um serviço específico, você pode adicionar o nome do serviço ao final do comando logs (por exemplo,
    `docker-compose logs -f app`).

    !!! info "Dica - Aguardando o banco de dados antes de iniciar a aplicação"
        Quando a aplicação está sendo inicializado, ela na verdade fica parada e aguarda o MySQL estar de pé e pronto antes de tentar se conectar a ele.
        O Docker não tem nenhum suporte interno para aguardar que outro contêiner esteja totalmente instalado, funcionando e pronto
        antes de iniciar outro contêiner. Para projetos baseados em nós, você pode usar a dependência
        [wait-port](https://github.com/dwmkerr/wait-port). Projetos semelhantes existem para outras linguagens/frameworks.

1. Neste ponto, você poderá abrir a aplicação e vê-la em execução. E ei! Estamos com um único comando!

## Derrubando tudo

Quando você estiver pronto para derrubar tudo, simplesmente execute `docker-compose down`. Os contêineres pararão e a rede será removida.

!!! warning "Removendo Volumes"
    Por padrão, os volumes nomeados no seu arquivo compose NÃO são removidos ao executar o `docker-compose down`. Se você quiser
    remover os volumes, você precisará adicionar a opção `--volumes`.

Uma vez desmontado, você pode mudar para outro projeto, executar `docker-compose up` e estar pronto para contribuir com esse OUTRO projeto! É realmente não fica muito mais simples que isso!


## Recapitulando

Nesta seção, aprendemos sobre o Docker Compose e como ele ajuda drasticamente a definição e
compartilhamento de aplicativos de vários serviços. Criamos um arquivo do Compose traduzindo os comandos que estávamos
usando no formato de composição apropriado.

Neste ponto, estamos começando a encerrar o tutorial. No entanto, existem algumas práticas recomendadas sobre
construção de imagem que queremos cobrir, pois há um grande problema com o Dockerfile que estamos usando. Então,
vamos dar uma olhada!