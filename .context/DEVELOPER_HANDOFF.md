# CampusPay — handoff obrigatório para desenvolvimento

Leia primeiro: [PRODUCT_CONTEXT.md](./PRODUCT_CONTEXT.md).

## Objetivo do time

Entregar um vertical slice de uma campanha estudantil:

`criar → aprovar → vender → confirmar pagamento → produzir → retirar com QR → fechar → verificar relatório`

## Não negociáveis

1. CampusPay não custodia reais no MVP.
2. Pix e Solana precisam convergir para o mesmo ledger.
3. Nenhuma PII pode ir para Solana, memo público ou logs.
4. Valores usam inteiros e moeda/mint explícita.
5. Eventos financeiros e webhooks são idempotentes.
6. Registros confirmados são corrigidos por reversão, nunca apagados.
7. Retirada no campus com QR/PIN é o fulfillment padrão.
8. Não criar token, NFT decorativo ou DAO desnecessária.
9. Admin da CampusPay não pode movimentar sozinho fundos da organização.
10. Toda feature precisa aparecer corretamente no fechamento da campanha.

## Escopo imediato

- Organização, membros, papéis e mandato.
- Campanha versionada com aprovação.
- Produto e variantes.
- Imagens de produto em storage.
- Pedido e checkout.
- Solana payment request com referência por pedido.
- Pix simulado ou PSP real atrás de adapter.
- Ledger de dupla entrada.
- Despesa e documento.
- Lote de produção e estoque.
- Retirada com QR single-use.
- Relatório canônico, hash e ancoragem em Devnet.

## Decisões técnicas aprovadas após alinhamento

Para acelerar o MVP funcional, a stack alvo passa a ser:

- Next.js com TypeScript para a aplicação.
- Supabase Auth para autenticação.
- Supabase Postgres para dados operacionais.
- Supabase Storage para imagens de produtos e documentos.
- Supabase RLS como camada adicional de isolamento multi-tenant.
- Next.js Server Actions ou Route Handlers para regras sensíveis.
- Solana Devnet para payment references e ancoragem de hash.

O protótipo inicial em `app/` é propositalmente estático e sem backend. Ele serve para visualizar o fluxo, alinhar UX e apoiar o vídeo do hackathon. A implementação real deve migrar essa experiência para Next.js sem perder o fluxo demonstrado.

Buckets recomendados:

- `product-images`: fotos públicas ou semi-públicas dos produtos vendidos.
- `documents`: orçamentos, recibos e comprovantes privados, servidos por URL assinada.

O cliente não deve escrever diretamente em tabelas financeiras ou de auditoria. Operações como confirmação de pagamento, lançamento de ledger, fechamento de relatório, ancoragem onchain e confirmação de retirada passam pelo servidor.

## Contrato de trabalho por feature

Antes de codificar, o responsável deve registrar:

- dor e ator atendidos;
- estados e transições afetados;
- papéis autorizados;
- dados criados/alterados;
- fronteira onchain/offchain;
- lançamento de ledger, se houver;
- audit event;
- idempotency key;
- métricas e logs;
- happy path e falhas;
- critério de aceite;
- ADR impactado.

## Perguntas de code review

- Existe risco de acesso entre organizações?
- Algum dado pessoal chega ao payload onchain?
- Retry duplica pagamento, lançamento, estoque ou entrega?
- O que acontece se PSP/RPC/webhook falhar?
- A ação aparece no relatório e no audit log?
- A correção preserva o histórico?
- Há segredo, seed ou signer no lugar errado?
- O usuário precisa entender blockchain para concluir a tarefa?

## Prompt para transferir contexto a outro desenvolvedor ou agente

```text
Você está trabalhando na CampusPay. Antes de propor arquitetura ou editar código,
leia integralmente campuspay/PRODUCT_CONTEXT.md e campuspay/DEVELOPER_HANDOFF.md.

A CampusPay conecta autorização, pré-venda, pagamento, produção, estoque,
retirada/entrega e prestação de contas de organizações estudantis.
Ela não é apenas um marketplace e não é um banco.

Respeite os ADRs, as máquinas de estado, a fronteira onchain/offchain, as regras
de ledger, idempotência, RBAC e privacidade. Não coloque PII onchain, não crie
token/NFT decorativo e não amplie custódia ou escrow sem decisão explícita.

Ao concluir sua tarefa, informe: arquivos alterados, decisões tomadas, ADRs
afetados, testes executados, riscos remanescentes e impacto no relatório final.
```

## Ordem recomendada de implementação

1. Schema, multi-tenancy, auth e RBAC.
2. State machines de campanha, pedido e pagamento.
3. Ledger e idempotência.
4. Campaign/catalog/order UI.
5. Adapter Solana + reconciliação.
6. Adapter Pix.
7. Produção/estoque.
8. QR fulfillment.
9. Relatório/hash/âncora.
10. Observabilidade, segurança e E2E.

## Definition of Done resumida

Uma feature não está pronta sem autorização backend, validação, estado de falha,
auditabilidade, teste, observabilidade e confirmação de que não expõe PII.
