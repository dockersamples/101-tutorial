
## Camadas de imagem

Você sabia que pode ver o que compõe uma imagem? Com o comando `docker image history`
você pode visualizar os comandos que foram utilizados para criar cada camada dentro de uma imagem.

1. Use o comando `docker image history` para ver as camadas da imagem `docker-101` que você criou
anteriormente.

    ```bash
    docker image history
    ```

    Você deve obter uma saída parecida com esta (datas/IDs podem ser diferentes).

    ```plaintext
    IMAGE               CREATED             CREATED BY                                      SIZE                COMMENT
    a78a40cbf866        18 seconds ago      /bin/sh -c #(nop)  CMD ["node" "/app/src/ind…   0B                  
    f1d1808565d6        19 seconds ago      /bin/sh -c yarn install --production            85.4MB              
    a2c054d14948        36 seconds ago      /bin/sh -c #(nop) COPY dir:5dc710ad87c789593…   198kB               
    9577ae713121        37 seconds ago      /bin/sh -c #(nop) WORKDIR /app                  0B                  
    b95baba1cfdb        7 weeks ago         /bin/sh -c #(nop)  CMD ["node"]                 0B                  
    <missing>           7 weeks ago         /bin/sh -c #(nop)  ENTRYPOINT ["docker-entry…   0B                  
    <missing>           7 weeks ago         /bin/sh -c #(nop) COPY file:238737301d473041…   116B                
    <missing>           7 weeks ago         /bin/sh -c apk add --no-cache --virtual .bui…   5.5MB               
    <missing>           7 weeks ago         /bin/sh -c #(nop)  ENV YARN_VERSION=1.17.3      0B                  
    <missing>           7 weeks ago         /bin/sh -c addgroup -g 1000 node     && addu…   65.4MB              
    <missing>           7 weeks ago         /bin/sh -c #(nop)  ENV NODE_VERSION=10.16.3     0B                  
    <missing>           5 months ago        /bin/sh -c #(nop)  CMD ["/bin/sh"]              0B                  
    <missing>           5 months ago        /bin/sh -c #(nop) ADD file:a86aea1f3a7d68f6a…   5.53MB  
    ```

    Cada uma das linhas representa uma camada na imagem. A tela aqui mostra a base na parte inferior com
    a camada mais nova na parte superior. Com isso, você também pode ver rapidamente o tamanho de cada camada, ajudando
    diagnosticar imagens grandes.

1. Você notará que várias das linhas estão truncadas. Se você adicionar o parâmetro `--no-trunc` terá como retorno a
    saída toda.

    ```bash
    docker image history --no-trunc docker-101
    ```


## Cache de camadas
Agora que você viu as camadas em ação, há uma lição importante a aprender para diminuir o tempo de build
da imagem do contêiner.

> Depois que uma camada muda, todas as camadas posteriores também precisam ser recriadas.

Vejamos o Dockerfile que estávamos usando mais uma vez...

```dockerfile
FROM node:10-alpine
WORKDIR /app
COPY . .
RUN yarn install --production
CMD ["node", "/app/src/index.js"]
```

Voltando à saída do histórico de imagens, vemos que cada comando no Dockerfile se torna uma nova camada na imagem.
Você deve se lembrar que quando fizemos uma alteração na imagem, as dependências tiveram que ser reinstaladas. Tem alguma
maneira de corrigir isso? Não faz muito sentido enviar as mesmas dependências toda vez que construímos, certo?

Para corrigir isso, precisamos reestruturar nosso Dockerfile para ajudar a suportar o cache das dependências. Para aplicações baseadas em node, essas dependências são definidas no arquivo `package.json`.Então, e se copiarmos apenas esse arquivo primeiro,
instalar as dependências e, em seguida, copiar em todo o resto? Em seguida, recriaremos as dependências apenas se houver
uma mudança para o `package.json`. Faz sentido?

1. Modifique o Dockerfile copiando o `package.json` primeiro, instale as dependências, e copie o resto depois.

    ```dockerfile hl_lines="3 4 5"
    FROM node:10-alpine
    WORKDIR /app
    COPY package.json yarn.lock ./
    RUN yarn install --production
    COPY . .
    CMD ["node", "/app/src/index.js"]
    ```

1. Gere a nova imagem com `docker build`.

    ```bash
    docker build -t docker-101 .
    ```

    Você terá um retorno parecido com este...

    ```plaintext
    Sending build context to Docker daemon  219.1kB
    Step 1/6 : FROM node:10-alpine
    ---> b95baba1cfdb
    Step 2/6 : WORKDIR /app
    ---> Using cache
    ---> 9577ae713121
    Step 3/6 : COPY package* yarn.lock ./
    ---> bd5306f49fc8
    Step 4/6 : RUN yarn install --production
    ---> Running in d53a06c9e4c2
    yarn install v1.17.3
    [1/4] Resolving packages...
    [2/4] Fetching packages...
    info fsevents@1.2.9: The platform "linux" is incompatible with this module.
    info "fsevents@1.2.9" is an optional dependency and failed compatibility check. Excluding it from installation.
    [3/4] Linking dependencies...
    [4/4] Building fresh packages...
    Done in 10.89s.
    Removing intermediate container d53a06c9e4c2
    ---> 4e68fbc2d704
    Step 5/6 : COPY . .
    ---> a239a11f68d8
    Step 6/6 : CMD ["node", "/app/src/index.js"]
    ---> Running in 49999f68df8f
    Removing intermediate container 49999f68df8f
    ---> e709c03bc597
    Successfully built e709c03bc597
    Successfully tagged docker-101:latest
    ```

    Você verá que todas as camadas foram reconstruídas. Até ai tudo bem, pois alteramos um pouco o Dockerfile.

1. Agora, faça alguma modificação no arquivo `src/static/index.html` (Mude por exemplo o `<title>` colocando "The Awesome Todo App").

1. Gere novamente a imagem Docker usando o `docker build` novamente. Dessa vez, a saida do comando será diferente.

    ```plaintext hl_lines="5 8 11"
    Sending build context to Docker daemon  219.1kB
    Step 1/6 : FROM node:10-alpine
    ---> b95baba1cfdb
    Step 2/6 : WORKDIR /app
    ---> Using cache
    ---> 9577ae713121
    Step 3/6 : COPY package* yarn.lock ./
    ---> Using cache
    ---> bd5306f49fc8
    Step 4/6 : RUN yarn install --production
    ---> Using cache
    ---> 4e68fbc2d704
    Step 5/6 : COPY . .
    ---> cccde25a3d9a
    Step 6/6 : CMD ["node", "/app/src/index.js"]
    ---> Running in 2be75662c150
    Removing intermediate container 2be75662c150
    ---> 458e5c6f080c
    Successfully built 458e5c6f080c
    Successfully tagged docker-101:latest
    ```

    Primeiro, você verá que a geração da imagem foi MUITO mais rápida! E note que nas etapas de 1 a 4 todas tem
    `Using cache`. Então, \o/! Estamos usando o cache de compilação. Agora para você enviar ou baixar essa imagem será muito mais rápido também.


## Construção em multi-estágios

Por Enquanto não vamos nos aprofundar muito neste assunto, o multi-stage build é uma forma muito eficiente
de criação de uma imagem. Existem várias vantagens, entre eles:

- Separar as dependências de tempo de construção das dependências de tempo de execução
- Reduzir o tamanho geral da imagem enviando somente o que sua app precisa executar

### Exemplo Maven/Tomcat

Ao criar aplicativos baseados em Java, é necessário um JDK para compilar o código-fonte no bytecode Java. Contudo,
o JDK não é necessário para produção. Além disso, você pode estar usando ferramentas como Maven ou Gradle para ajudar a criar o aplicativo. Esses também não são necessários em nossa imagem final. O multi stage build ajuda bastante neste caso.

```dockerfile
FROM maven AS build
WORKDIR /app
COPY . .
RUN mvn package

FROM tomcat
COPY --from=build /app/target/file.war /usr/local/tomcat/webapps 
```

Neste exemplo, usamos um estágio (chamado`build`) para executar a compilação das dependências da aplicação Java usando o Maven. No segundo estágio (começando no `FROM tomcat`), copiamos os arquivos do estágio `build`. A imagem final é apenas a última etapa que será criada (e que pode ser substituído usando o parâmetro `--target`).


### Exemplo React

Quando compilamos uma aplicação React, nós precisamos de um ambiente Node para compilar o código JS (normalmente JSX), SASS stylesheets, e mais HTML estático, JS e CSS. Se não estamos fazendo renderização no servidor, nem precisamos de um ambiente Node
para a nossa execução. Por que não enviar os recursos estáticos em um contêiner estático nginx?

```dockerfile
FROM node:10 AS build
WORKDIR /app
COPY package* yarn.lock ./
RUN yarn install
COPY public ./public
COPY src ./src
RUN yarn run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
```

Aqui, estamos usando uma imagem `node:10` para executar a compilação (maximizando o cache da camada) e, em seguida, copiando a saída em um contêiner nginx. Legal né?


## Recapitulando

Ao entender um pouco sobre como as imagens são estruturadas, podemos criar imagens mais otimizadas e enviar menos alterações.
Multi Stage Build também nos ajuda a reduzir o tamanho geral da imagem e aumentar a segurança final do contêiner, separando dependências em tempo de construção das dependências de tempo de execução.

