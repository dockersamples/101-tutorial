Embora tenhamos terminado nosso workshop, ainda há MUITO a aprender sobre contêineres! 
Não vamos nos aprofundar aqui, mas aqui estão algumas outras áreas para ver a seguir!

## Orquestração de Contêineres

Utilizar contêineres em produção é difícil. Você não logar em uma máquina e simplismente rodar 
`docker run` ou `docker-compose up`. Por que não? Bem, o que acontece se os contêineres morrerem?
Como você escala através de várias maquinas? Orquestração de contêineres resolve esse problema.
Ferramentas como Kubernetes, Swarm, Nomad e ECS resolvem esse problema, cada um de uma forma um 
pouco diferente do outro.

A ideia geral é que você tenha "managers" que recebam **estados esperados**. Esse estado pode ser 
"Eu quero rodar duas instâncias da minha aplicação web e expor a porta 80". Os managers então olham
para todas as máquinas do cluster e delega o trabalho para os nós "worker". Os managers observam as 
mudanças (por exemplo, um contêiner finalizando) e então trabalha para fazer que o **estado atual** reflita
o estado esperado.

## Projetos do Cloud Native Computing Foundation

O CNCF é um local neutro em relação a fornecedores para vários projetos open-source, incluindo Kubernetes, 
Prometheus, Envoy, Linkerd, NATS e mais! Você pode ver os [projetos incubados e graduados aqui](https://www.cncf.io/projects/)
e todo o [panorama CNCF aqui](https://landscape.cncf.io/). Existem MUITOS projetos que ajudam a resolver
problemas de monitoramento, logging, segurança, repositório de imagens, mensageria e mais!

Então, se você é novo no mundo dos contêineres e do desenvolvimento de aplicações cloud-native, seja 
bem-vindo! Por favor, conecte-se com a comunidade, faça perguntas e continue aprendendo! Estamos felizes
por ter você aqui!