# Mapa dos criterios do hackathon

Este documento mapeia a CampusPay aos criterios de avaliacao indicados pelo Hackathon Universitario da Superteam Brasil.

## Resumo dos criterios

| Criterio | Peso | Como a CampusPay responde |
|---|---:|---|
| Problema | 30% | Resolve uma dor real de campanhas estudantis brasileiras: conciliacao, retirada e prestacao de contas. |
| Solucao | 25% | Entrega uma jornada completa e viavel: campanha, venda, pagamento, producao, retirada e relatorio. |
| Fit cultural | 20% | Foi desenhada para atleticas, CAs, DCEs, republicas e entidades brasileiras que usam Pix e operam no campus. |
| Uso da Solana | 15% | Usa Solana para verificacao: Solana Pay por pedido e hash do relatorio final em Devnet. |
| Clareza do pitch | 10% | Possui roteiro de ate 5 minutos, demo guiada e mensagem central simples. |

## Problema - 30%

Dor principal:

- entidades estudantis vendem com ferramentas fragmentadas;
- a operacao depende de pessoas especificas;
- pagamentos, estoque, despesas e retirada ficam espalhados;
- a troca de gestao causa perda de historico;
- a prestacao de contas costuma ser manual e contestavel.

Por que o problema e especifico:

- o publico inicial sao organizacoes estudantis;
- os casos de uso sao camisetas, kits, ingressos, eventos e produtos de campus;
- o ciclo inclui retirada presencial e producao por lote;
- o contexto brasileiro inclui Pix, WhatsApp, planilhas e gestao voluntaria.

Evidencias no MVP:

- rotas de pedidos, financeiro, estoque, retirada, usuarios e logs;
- ledger e relatorio final;
- QR/PIN de retirada;
- relatorio publico verificavel.

## Solucao - 25%

A solucao e viavel porque nao exige reinventar todo o sistema financeiro da entidade. Ela organiza o que a entidade ja faz em um fluxo unico:

```text
criar campanha -> publicar -> vender -> reconciliar -> produzir -> entregar -> fechar
```

O MVP cobre:

- criacao de organizacao;
- criacao de campanha e produto;
- imagem de produto;
- marketplace do campus;
- checkout;
- pedido;
- confirmacao de pagamento;
- producao e estoque;
- retirada;
- fechamento e relatorio publico.

O usuario comprador e o gestor possuem jornadas separadas, com linguagem e permissoes diferentes.

## Fit cultural brasileiro - 20%

A CampusPay foi pensada para o funcionamento real de campanhas universitarias no Brasil:

- Pix como trilho de pagamento predominante;
- campanhas por atleticas, CAs, DCEs e coletivos;
- produtos comuns como camisetas, moletons, kits, ingressos e eventos;
- retirada no campus;
- prestacao para conselho, assembleia, universidade ou proxima gestao;
- operacao por estudantes, com pouco tempo e alta rotatividade.

O marketplace local por campus evita uma vitrine generica. A descoberta acontece onde a campanha faz sentido: dentro da comunidade que participa dela.

## Uso da Solana - 15%

Solana tem papel claro:

- gerar uma referencia unica por pedido no padrao Solana Pay;
- permitir conciliacao de uma transacao onchain com um pedido offchain;
- ancorar o hash do relatorio final na Devnet;
- permitir verificacao publica sem expor dados pessoais.

O que nao fazemos:

- token proprio;
- NFT decorativo;
- DAO artificial;
- PII onchain;
- custodia de reais;
- prometer rendimento ou modelo financeiro especulativo.

Esse desenho deixa a blockchain como camada de prova e interoperabilidade, nao como enfeite.

## Clareza do pitch - 10%

Mensagem central recomendada:

> Vender uma camiseta e simples. Provar quanto entrou, quanto saiu, quem recebeu e para onde foi o saldo e o trabalho que quebra a operacao.

Roteiro sugerido:

1. Mostrar o problema com Forms, Pix, planilhas e WhatsApp.
2. Mostrar a CampusPay conectando a campanha inteira.
3. Explicar por que Solana resolve verificacao e conciliacao.
4. Demonstrar marketplace, checkout, gestao, retirada e relatorio.
5. Fechar com proximos passos: piloto com entidade real e Pix PSP.

O roteiro completo esta em [Roteiro do pitch](./pitch.md).
