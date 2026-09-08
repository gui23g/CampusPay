# Guia de demonstracao

Este guia descreve uma trilha coesa para avaliar o MVP. A demo pode ser feita com mocks ligados ou com Supabase/Solana configurados.

## Antes da demo

Verifique:

- `web/.env.local` existe;
- `NEXT_PUBLIC_ENABLE_MOCKS=true` para demo offline ou `false` para Supabase/Solana reais;
- `npm install` ja foi executado em `web/`;
- `npm run dev` esta rodando;
- o navegador abre `http://localhost:3000`.

Para demo real, siga [Setup do MVP](./setup.md).

## Jornada 1 - Comprador

Objetivo: mostrar que um estudante consegue descobrir uma campanha e comprar.

1. Abra `/campus/inteli-sp`.
2. Escolha uma campanha publicada.
3. Clique para ver ou comprar.
4. Confirme que a aplicacao abre `/c/:campaignSlug`.
5. Selecione variante e quantidade.
6. Preencha dados minimos de comprador.
7. Gere o pedido.
8. Observe codigo publico do pedido, status e informacoes de pagamento.
9. Entre em `/me/orders` para ver os pedidos do comprador.
10. Abra `/me/pickups/:orderCode` quando o pedido estiver liberado para retirada.

Resultado esperado:

- o comprador passa do marketplace para a campanha;
- o checkout cria um pedido;
- o pedido aparece na conta do comprador;
- o QR/PIN de retirada fica separado da gestao da organizacao.

## Jornada 2 - Dono ou gestor da campanha

Objetivo: mostrar que a organizacao consegue operar a campanha inteira.

1. Abra `/login` e entre com uma conta.
2. Abra `/app/users`.
3. Crie ou selecione uma organizacao.
4. Abra `/app/campaigns/new`.
5. Crie campanha, produto, variantes, preco e quantidade.
6. Suba uma imagem do produto.
7. Publique ou aprove a campanha conforme fluxo disponivel.
8. Abra `/app/orders`.
9. Veja pedidos recebidos.
10. Confirme pagamento quando aplicavel.
11. Abra `/app/inventory`.
12. Confira producao, variantes e estoque.
13. Abra `/app/pickup`.
14. Confirme retirada com codigo/PIN do pedido.
15. Abra `/app/finance`.
16. Confira ledger, receitas e eventos financeiros.
17. Abra `/app/reports/:id` ou gere o fechamento mais recente.

Resultado esperado:

- a organizacao opera campanha, produto, pedidos, pagamentos, estoque, retirada e fechamento;
- a visao de gestao nao se mistura com a visao do comprador;
- acoes sensiveis passam por APIs internas.

## Jornada 3 - Auditoria publica

Objetivo: demonstrar transparencia sem expor dados pessoais.

1. Abra `/reports/:publicId`.
2. Confira os totais do relatorio publico.
3. Veja o hash do snapshot.
4. Use o verificador do relatorio.
5. Altere o JSON no simulador, quando disponivel, para observar falha de verificacao.
6. Se Solana estiver configurada, confira assinatura/hash em Devnet.

Resultado esperado:

- o relatorio publico e independente da area logada;
- dados pessoais nao aparecem;
- o hash permite detectar alteracao.

## Jornada 4 - Protecao de rotas

Objetivo: validar que telas privadas exigem login quando mocks estao desligados.

1. Configure `NEXT_PUBLIC_ENABLE_MOCKS=false`.
2. Abra uma janela anonima.
3. Acesse `/app`.
4. Confirme redirecionamento para `/login?next=/app`.
5. Repita com `/me`.

Resultado esperado:

- telas protegidas redirecionam para login;
- telas publicas continuam acessiveis.

## Dados mock versus dados reais

Com `NEXT_PUBLIC_ENABLE_MOCKS=true`:

- a aplicacao mostra uma campanha demonstrativa;
- APIs podem responder dados simulados;
- e possivel apresentar o fluxo sem Supabase.

Com `NEXT_PUBLIC_ENABLE_MOCKS=false`:

- campanhas, produtos, pedidos, usuarios, logs, estoque, financeiro e relatorios dependem do Supabase;
- se o banco estiver vazio, algumas telas aparecerao vazias ate a primeira organizacao/campanha ser criada;
- rotas privadas exigem sessao.

## Checklist rapido para avaliacao

- A proposta resolve uma dor real e especifica?
- O comprador consegue sair do campus marketplace e chegar no checkout?
- O gestor consegue operar a campanha sem depender de planilhas externas?
- O fluxo de retirada e auditavel?
- O relatorio final pode ser verificado?
- Solana tem papel de reconciliacao/prova, e nao apenas decoracao?
