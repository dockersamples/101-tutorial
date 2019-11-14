
Agora que criamos uma imagem, vamos compartilhá-la! Para compartilhar imagens do Docker, você precisa usar o Docker Registry,
o repositório padrão é o Docker Hub e é de onde vieram todas as imagens que usamos.

## Criando um repositório

Para enviar uma imagem por push, primeiro precisamos criar um repositório no Docker Hub.

1. Vá até [Docker Hub](https://hub.docker.com) e faça login se precisar.

1. Clique no botão **Create Repository**.

1. Como nome de repositório, utilize `101-todo-app`. Verifique se a visibilidade está como `Public`.

1. Clique no botão **Create**!

Se você olhar no lado direito da página, verá uma seção chamada **Docker commands**. Isto dá
um exemplo de comando que você precisará executar para enviar para este repositório.

![Docker command with push example](push-command.png){: style=width:75% }
{: .text-center }


## Enviando sua imagem

1. De volta à sua instância do PWD, tente executar o comando, você deve receber um erro que parecido
como isso:

    ```plaintext
    $ docker push dockersamples/101-todo-app
    The push refers to repository [docker.io/dockersamples/101-todo-app]
    An image does not exist locally with the tag: dockersamples/101-todo-app
    ```

    Por que falhou? O comando push estava procurando uma imagem denominada dockersamples/101-todo-app, mas
     não encontrou uma. Se você executar `docker image ls`, também não verá uma.

    Para consertar isso, precisamos "marcar" nossa imagem, o que basicamente significa atribuir outro nome a ela.

1. Faça o login no Docker Hub utilizando o comando `docker login -u YOUR-USER-NAME`.

1. Use o comando `docker tag` para dar à imagem `docker-101` um novo nome. Certifique-se de trocar
    `YOUR-USER-NAME` com seu ID do Docker.

    ```bash
    docker tag docker-101 YOUR-USER-NAME/101-todo-app
    ```

1. Agora tente o comando push novamente.

    ```bash
    docker push YOUR-USER-NAME/101-todo-app
    ```

## Executando sua imagem em um novo servidor

Agora que nossa imagem foi criada e inserida em um registro, vamos tentar executar nossa aplicação em uma nova
instância que nunca viu esse contêiner!

1. Volte no PWD, clique em **Add New Instance** para criar uma nova instância.

1. Na nova instância, inicie a aplicação recém enviada.

    ```bash
    docker run -dp 3000:3000 YOUR-USER-NAME/101-todo-app
    ```

    Você deve ver a imagem sendo baixada, e depois o container sendo criado.

1. Clique no link "3000" quando ele aparecer e você deverá ver a aplicação com suas modificações! \o/!


## Recapitulando

Nesta seção, aprendemos como compartilhar nossas imagens, enviando-as para um repositório. Depois iniciamos uma
nova instância e fomos capazes de executar a imagem recém enviada. Isso é bastante comum em pipelines de IC,
onde o pipeline criará a imagem e a enviará para um registro e, em seguida, para o ambiente de produção
utilizando a versão mais recente da imagem.

Agora que já descobrimos isso, vamos voltar ao que aprendemos no final da última
seção. Como você deve se lembrar, percebemos que, quando reiniciamos a aplicação, perdemos todos os itens da lista de tarefas.
Obviamente, essa não é uma ótima experiência do usuário, então vamos aprender como podemos persistir os dados depois de
reiniciar!