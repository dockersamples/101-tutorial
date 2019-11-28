
Como uma pequena solicitação de funcionalidade, fomos acionados pela equipe de produto para que seja alterado 
o "texto vazio" quando não tivermos nenhum item da lista de tarefas. Eles
gostariam de fazer a transição para o seguinte:

> Sem tarefas ainda! Adicione uma acima!

Simples, não? Vamos fazer essa mudança.

## Atualizando nosso código fonte

1. No arquivo `~/app/src/static/js/app.js` atualize a linha 56 para que o novo "texto vazio" seja utilizado. ([Dicas de edição de arquivos no PWD aqui](/dicas-pwd/#editando-arquivos))

    ```diff
    - <p className="text-center">No items yet! Add one above!</p>
    + <p className="text-center">Sem tarefas ainda! Adicione uma acima!</p>
    ```

1. Vamos construir uma versão atualizada da imagem usando o mesmo comando usado anteriormente.

    ```bash
    docker build -t docker-101 .
    ```

1. Vamos iniciar um novo contêiner usando a imagem com código atualizado.

    ```bash
    docker run -dp 3000:3000 docker-101
    ```

**Oh!** Você provavelmente viu um erro como o seguinte (os IDs serão diferentes):

```bash
docker: Error response from daemon: driver failed programming external connectivity on endpoint laughing_burnell
(bb242b2ca4d67eba76e79474fb36bb5125708ebdabd7f45c8eaf16caaabde9dd): Bind for 0.0.0.0:3000 failed: port is already allocated.
```

Então o que aconteceu? Não podemos iniciar o novo contêiner porque nosso contêiner antigo ainda está
em execução. A razão pela qual isso é um problema é porque esse contêiner está usando a porta 3000 e
apenas um processo (contêineres inclusos) pode ouvir uma porta específica. Para corrigir isso, precisamos remover
o contêiner antigo.


## Substituindo nosso contêiner velho

Para remover um contêiner, ele primeiro precisa ser parado. Em seguida, pode ser removido.

1. Obtenha o ID do contêiner usando o comando `docker ps`.

    ```bash
    docker ps
    ```

1. Use o comando `docker stop` para parar o contêiner.

    ```bash
    # Troque <container-id> pelo ID obtido com o comando docker ps
    docker stop <container-id>
    ```

1. Depois que o contêiner parar, você pode removê-lo usando o comando `docker rm`.

    ```bash
    docker rm <container-id>
    ```

1. Agora, inicie sua aplicação atualizada.

    ```bash
    docker run -dp 3000:3000 docker-101
    ```

1. Abra a aplicação e você verá seu texto de ajuda atualizado!

![Aplicação atualizada com texto vazio atualizado](todo-list-updated-empty-text.png){: style="width:55%" }
{: .text-center }

!!! info "Dica"
    Você pode parar e remover um contêiner em um único comando adicionando a opção "force"
    ao comando `docker rm`. Por exemplo: `docker rm -f <container-id>`

## Recapitulando

Embora pudéssemos criar uma atualização, tem duas coisas que você deve ter notado:

- Todos os itens existentes em nossa lista de tarefas desapareceram! Esse não é muito bom para uma aplicação! Falaremos sobre isso
Em breve.
- Havia muitas etapas envolvidas para uma mudança tão pequena. Em uma próxima seção, falaremos sobre
como ver as atualizações de código sem precisar reconstruir e iniciar um novo contêiner toda vez que fazemos uma alteração.

Antes de falar sobre a persistência, veremos rapidamente como compartilhar essas imagens com outras pessoas.
