---
próximo: app.md
---

## O comando que acabou de executar

Parabéns! Você iniciou o contêiner para este tutorial!
Vamos primeiro explicar o comando que você acabou de executar. Caso você tenha esquecido,
aqui está o comando:

```cli
docker run -d -p 80:80 dockersamples/101-tutorial
```

Você notará algumas opções sendo usadas. Aqui estão mais algumas informações sobre elas:

- `-d` - executa o contêiner no modo desanexado (em segundo plano)
- `-p 80:80` - mapeia a porta 80 do host para a porta 80 do contêiner
- `dockersamples/101-tutorial` - a imagem em uso

!!! info "Dica"
    Você pode combinar opções com caracteres únicos para diminuir o tamanho do comando completo.
    Como exemplo, o comando acima pode ser escrito como:
    ```
    docker run -dp 80:80 dockersamples/101-tutorial
    ```

## O que é um contêiner?

Agora que você executou um contêiner, o que _é_ um contêiner? Simplificando, um contêiner é
simplesmente outro processo em sua máquina que foi isolado de todos os outros processos
na máquina host. Esse isolamento aproveita os [namespaces do kernel e cgroups](https://medium.com/@saschagrunert/demystifying-containers-part-i-kernel-space-2c53d6979504), recursos que estão no Linux há muito tempo. O Docker trabalhou para tornar esses recursos acessíveis e fáceis de usar.

!!! info "Criando containers a partir do zero"
    Se você gostaria de ver como os contêineres são construídos a partir do zero, Liz Rice, da Aqua Security
    tem uma palestra fantástica na qual ela cria um contêiner do zero usando Go. Ela cria
    um contêiner simples, essa palestra não entra em rede, usando imagens para o sistema de arquivos,
    e mais. Mas, essa palestra dá um _fantástico_ e profundo mergulho de como as coisas estão funcionando.

    <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/8fi7uSYlOdc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## O que é uma imagem de contêiner?

Ao executar um contêiner, ele usa um sistema de arquivos isolado. Este sistema de arquivos personalizado é fornecido
por uma **imagem de contêiner**. Como a imagem contém o sistema de arquivos do contêiner, ela deve conter tudo
necessário para executar uma aplicação - todas as dependências, configurações, scripts, binários etc.
A imagem também contém outra configuração para o contêiner, como variáveis de ambiente,
um comando padrão para executar e outros metadados.

Mais adiante, aprofundaremos nas imagens, abordando tópicos como camadas, melhores práticas e mais.

!!! info
    Se você está familiarizado com o `chroot`, pense em um contêiner como uma versão estendida do `chroot`. O
    sistema de arquivos é simplesmente provido pela imagem. Mas, um contêiner adiciona isolamento adicional que não
    está disponível ao usar simplesmente chroot.
