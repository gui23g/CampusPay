# Resumo executivo

## O que e a CampusPay

A CampusPay e uma infraestrutura de campanhas verificaveis para organizacoes estudantis. Ela ajuda atleticas, centros academicos, diretorios e coletivos universitarios a vender produtos ou ingressos sem perder controle financeiro, operacional e documental.

O produto conecta:

```text
aprovacao -> pre-venda -> pagamento -> producao -> estoque -> retirada -> ledger -> relatorio publico
```

## Problema

Campanhas estudantis normalmente nascem em ferramentas soltas: Forms para pedidos, Pix em conta pessoal, planilha para conciliar, WhatsApp para suporte, outra planilha para retirada e mensagens espalhadas para aprovar despesas.

Isso funciona no momento da venda, mas quebra no fechamento. A organizacao precisa responder perguntas simples com evidencias:

- quantas unidades foram vendidas;
- quanto dinheiro entrou;
- quais pedidos foram pagos, cancelados ou retirados;
- quais despesas foram aprovadas;
- quanto sobrou;
- quem aprovou cada etapa;
- o que a proxima gestao deve receber.

O problema e especialmente brasileiro porque mistura Pix, informalidade operacional, entidades estudantis com troca frequente de gestao, prestacao de contas sensivel e eventos/produtos vendidos dentro do campus.

## Solucao

A CampusPay centraliza a campanha inteira em um historico auditavel:

- a organizacao cria campanha, produto, variantes, meta e periodo;
- a campanha e aprovada antes da venda;
- estudantes compram pelo marketplace local do campus;
- cada pedido recebe codigo publico, referencia de pagamento e status;
- pagamentos alimentam pedidos, ledger e conciliacao;
- a producao consolida demanda por variante;
- a retirada usa QR/PIN e registra operador;
- o fechamento gera um relatorio publico sem PII;
- o hash do relatorio pode ser ancorado na Solana Devnet.

## Por que Solana

Solana entra onde existe necessidade real de verificacao, nao como elemento decorativo.

Usos previstos no MVP:

- Solana Pay com `reference` unica por pedido, permitindo reconciliar transacoes com pedidos especificos;
- hash SHA-256 do relatorio final ancorado em Devnet;
- link publico de verificacao para provar que o relatorio exibido corresponde ao snapshot fechado.

A aplicacao mantem dados pessoais offchain. A blockchain registra somente referencias opacas, wallets, assinaturas e hashes.

## MVP entregue

O repositorio contem uma aplicacao em `web/` com:

- gestao da organizacao em `/app`;
- marketplace local em `/campus/:slug`;
- checkout publico em `/c/:campaignSlug`;
- conta do comprador em `/me`;
- relatorio publico em `/reports/:publicId`;
- login/cadastro via Supabase Auth;
- protecao de rotas privadas;
- CRUD por APIs internas;
- upload de imagens para Supabase Storage quando configurado;
- modo claro/noturno;
- modo mock opcional para apresentacao sem infraestrutura externa;
- fluxo real preparado para Supabase e Solana Devnet.

## Usuarios

Comprador:

- cria conta;
- completa perfil;
- encontra campanhas do campus;
- compra produto/variante;
- acompanha pedidos;
- acessa QR/PIN de retirada.

Dono ou gestor de campanha:

- cria organizacao;
- convida membros;
- cria campanha e produto;
- publica campanha;
- acompanha pedidos;
- confirma pagamento;
- acompanha producao, estoque e retirada;
- fecha relatorio.

Avaliador ou auditor:

- acessa relatorio publico;
- compara totais;
- verifica o hash do snapshot.

## Diferencial

A CampusPay nao compete apenas com lojas virtuais. O diferencial e resolver a cadeia completa de confianca de uma campanha estudantil:

- governanca antes da venda;
- conciliacao por pedido;
- ledger de campanha;
- retirada auditavel;
- relatorio reproduzivel;
- prova publica via Solana.

## Limitacoes conscientes do MVP

- Pix real ainda depende de integracao com PSP.
- O uso recomendado de Solana no hackathon e Devnet.
- A validacao onchain deve ser reforcada antes de um piloto com dinheiro real, conferindo valor, mint, destinatario, assinatura e idempotencia.
- Documentos financeiros privados devem usar URLs assinadas em producao.
- O MVP prova a jornada e a arquitetura, mas ainda requer piloto real para calibrar regras de operacao e permissao.
