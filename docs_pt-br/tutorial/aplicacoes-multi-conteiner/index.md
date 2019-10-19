
Até este ponto, nós estavamos trabalhando com apps executando em apenas um container. Mas, agora nós vamos adicionar um banco MySQL a nossa aplicação. A seguinte pergunta geralmente surge - "Onde o MySQL será executado? Instalar no mesmo
contêiner ou executá-lo separadamente?" Em geral, **cada contêiner deve fazer apenas uma coisa e fazê-la muito bem.** Algumas
razões:

- Há uma boa chance de você escalar APIs e front-ends de maneira diferente do banco de dados
- Contêineres separados permitem versões diferentes e a atualizações de versões isoladamente
- Embora você possa usar um contêiner para o banco de dados localmente, convém usar um serviço gerenciado 
  para o banco de dados em produção
- Talvez você não deseje enviar seu banco de dados com seu aplicativo
- A execução de vários processos exigirá um gerenciador de processos (o contêiner inicia apenas um processo),
  o que adiciona complexidade à inicialização/desligamento de contêineres

E há mais razões. Portanto, atualizaremos nossa app para funcionar assim:

![Todo App connected to MySQL container](multi-app-architecture.png)
{: .text-center }


## Trabalhando em rede

Lembre-se de que os contêineres, por padrão, são executados isoladamente e não sabem nada sobre outros processos
ou contêiners na mesma máquina. Então, como permitimos que um contêiner fale com outro? A resposta é
**rede**. Agora, você não precisa ser um engenheiro de rede (\o/). Lembre-se simplesmente desta regra...

> Se dois contêineres estiverem na mesma rede, eles poderão se comunicar. Se não estiverem, não podem.

## Iniciando o banco MySQL

Existem duas maneiras de colocar um contêiner em uma rede: 1) Atribua-o no início ou 2) conecte um contêiner existente.
Por enquanto, criaremos a rede primeiro e anexaremos o contêiner MySQL na inicialização do mesmo.

1. Crie a rede.

    ```bash
    docker network create todo-app
    ```

1. Inicie um contêiner MySQL e conecte-o à rede. Também vamos definir algumas variáveis de ambiente que o
  banco de dados utilizará para inicializar o banco de dados (consulte a seção "Variáveis de ambiente" no [MySQL Docker Hub listing](https://hub.docker.com/_/mysql/)).

    ```bash
    docker run -d \
        --network todo-app --network-alias mysql \
        -v todo-mysql-data:/var/lib/mysql \
        -e MYSQL_ROOT_PASSWORD=secret \
        -e MYSQL_DATABASE=todos \
        mysql:5.7
    ```

    Você também verá que especificamos o parâmetro `--network-alias`. Voltaremos a isso mais tarde.

    !!! info "Dica"
        Você notará que estamos usando um volume chamado `todo-mysql-data` aqui e montamos em `/var/lib/mysql` que é
        o local onde o MySQL armazena seus dados. No entanto, nunca executamos o comando `docker volume create`. O Docker
        reconhece que queremos usar um volume nomeado e cria um automaticamente para nós.

1. Para confirmar se o banco de dados está em funcionamento, execute o comando abaixo e veja se o mesmo está conectando.

    ```bash
    docker exec -it <mysql-container-id> mysql -p
    ```

    Quando o prompt pedindo senha aparecer, digite **secret**. No cli do MySQL, liste os bancos de dados e verifique
  se você vê o banco de dados `todos`.

    ```cli
    mysql> SHOW DATABASES;
    ```

    Você deve ver uma saída parecida com esta:

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

    \o/! Temos nosso banco de dados `todos` e está pronto para ser usado!


## Conectando ao banco MySQL

Agora que sabemos que o MySQL está em funcionamento, vamos usá-lo! Mas, a questão é... como? Se executarmos
outro contêiner na mesma rede, como encontramos o contêiner (lembre-se de que cada contêiner tem seu próprio IP)?

Para descobrir, vamos usar o contêiner [nicolaka/netshoot](https://github.com/nicolaka/netshoot) que é fornecido com um monte de ferramentas úteis para solucionar problemas ou depurar problemas de rede.

1. Inicie um novo contêiner usando a imagem nicolaka/netshoot. Certifique-se de conectá-lo à mesma rede.

    ```bash
    docker run -it --network todo-app nicolaka/netshoot
    ```

1. Dentro do contêiner, vamos usar o comando `dig`, que é uma ferramenta para testar a resolução de nomes (DNS). Nós vamos procurar o endereço IP para o nome do host `mysql`.

    ```bash
    dig mysql
    ```

    E você terá uma saída como essa...

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

    Na linha "ANSWER SECTION", você verá um registro `A` para` mysql` que resolve para `172.23.0.2`
     (seu endereço IP provavelmente terá um valor diferente). Enquanto `mysql` normalmente não é um nome de host válido,
   o Docker conseguiu resolvê-lo no endereço IP do contêiner que tinha esse alias de rede (lembre-se do
   parâmetro `--network-alias` que usamos anteriormente?).

    Isso significa que... nossa app só precisa se conectar a um host chamado `mysql` e ele conversará com o
   banco de dados! Muito mais simples!


## Executando sua App com banco MySQL

A aplicação "todo" suporta a configuração de algumas variáveis de ambiente para especificar as configurações de conexão do MySQL. Eles são:

- `MYSQL_HOST` - Nome ou IP do servidor de banco de dados
- `MYSQL_USER` - Nome de usuário para conexão
- `MYSQL_PASSWORD` - Senha do usuário para conexão
- `MYSQL_DB` - Nome do banco de dados que será utilizado

!!! warning "Cuidado!"
    Embora o uso de env vars para definir configurações de conexão seja geralmente aceitável para desenvolvimento, ele é
    **NÃO É RECOMENDADO** ao executar aplicações em produção. Diogo Monica, ex-líder de segurança da Docker, 
    [escreveu um post fantástico](https://diogomonica.com/2017/03/27/why-you-shouldnt-use-env-variables-for-secret-data/)
    explicando o porquê. 
    
    Um mecanismo mais seguro é usar a opção de "secrets" fornecido por sua estrutura de orquestração de contêiner. Na maioria dos
    casos, essas secrets são montadas como arquivos no contêiner em execução. Você verá muitas aplicações (incluindo a imagem do MySQL
    e a aplicação "todo") também suporta env vars com um sufixo `_FILE` para apontar para o caminho que contém o arquivo. 
    
    Por exemplo, definir a variável `MYSQL_PASSWORD_FILE` fará com que a aplicação use o conteúdo do arquivo referenciado 
    como a senha de conexão. O Docker não faz nada para oferecer suporte a esses ambientes. Sua aplicação precisará saber para
    procurar a variável e obtenha o conteúdo do arquivo.

Com tudo isso explicado, vamos começar nosso contêiner pronto para desenvolvimento!

1. Especificaremos cada uma das variáveis de ambiente acima, além de conectar o contêiner à nossa rede.

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

1. Se olharmos para os logs do contêiner (`docker logs <container-id>`), devemos ver uma mensagem indicando que está
    usando o banco de dados mysql.

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

1. Abra a aplicação no seu navegador e adicione alguns itens à sua lista de tarefas.

1. Conecte-se ao banco de dados mysql e verifique que os itens estão sendo gravados no banco de dados. Lembre-se, a senha
   é **secret**.

    ```bash
    docker exec -ti <mysql-container-id> mysql -p todos
    ```

    E no cli do mysql, execute o seguinte:

    ```plaintext
    mysql> select * from todo_items;
    +--------------------------------------+--------------------+-----------+
    | id                                   | name               | completed |
    +--------------------------------------+--------------------+-----------+
    | c906ff08-60e6-44e6-8f49-ed56a0853e85 | Do amazing things! |         0 |
    | 2912a79e-8486-4bc3-a4c5-460793a575ab | Be awesome!        |         0 |
    +--------------------------------------+--------------------+-----------+
    ```

    Obviamente, sua tela terá uma aparência diferente porque possui seus itens. Mas você deve vê-los armazenados lá!


## Recapitulando

Neste ponto, temos uma aplicação que agora armazena seus dados em um banco de dados externo em execução em um contêiner separado. Aprendemos um pouco sobre a rede de contêineres e vimos como a descoberta de serviços pode ser realizada
usando DNS.

Mas há uma boa chance de você começar a se sentir um pouco sobrecarregado com tudo o que precisa fazer para iniciar
esta aplicação. Temos que criar uma rede, iniciar contêineres, especificar todas as variáveis de ambiente, expor
portas e muito mais! Isso é muito para lembrar e certamente está tornando as coisas mais difíceis de passar para outra pessoa.

Na próxima seção, falaremos sobre o Docker Compose. Com o Docker Compose, podemos compartilhar nossas aplicações de uma
maneira muito mais fácil e permitir que outros subam nossa aplicação com um único comando!


