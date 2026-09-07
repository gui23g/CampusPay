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
- Alternância de experiência entre Gestão da organização e Marketplace/comprador.
- Modo claro e modo noturno como preferência de interface.
- Campanha versionada com aprovação.
- Produto e variantes.
- Imagens de produto em storage.
- Marketplace local por campus para descoberta de campanhas ativas.
- Conta do comprador com pedidos, retirada, dados, pagamentos, preferências e suporte.
- Pedido e checkout.
- Solana payment request com referência por pedido.
- Pix simulado ou PSP real atrás de adapter.
- Ledger de dupla entrada.
- Despesa e documento.
- Lote de produção e estoque.
- Retirada com QR single-use.
- Gestão de usuários, convites, papéis e logs de atividade.
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

A superfície principal é `web/`, em Next.js, com jornadas separadas em rotas reais.

Buckets recomendados:

- `product-images`: fotos públicas ou semi-públicas dos produtos vendidos.
- `documents`: orçamentos, recibos e comprovantes privados, servidos por URL assinada.

O cliente não deve escrever diretamente em tabelas financeiras ou de auditoria. Operações como confirmação de pagamento, lançamento de ledger, fechamento de relatório, ancoragem onchain e confirmação de retirada passam pelo servidor.

## Estado atual do front-end

O MVP principal está em `web/`, usando Next.js/TypeScript. Ele cobre:

- rotas reais separadas para Gestão, Marketplace, Minha conta e Relatório público;
- visão geral da campanha para a organização;
- campanha versionada, produto, variantes e imagem;
- upload de imagem com preview local e envio para Supabase Storage quando envs reais estiverem configuradas;
- marketplace local do campus;
- checkout público com Pix e Solana mockados;
- conta do comprador com pedidos, QR de retirada, dados, pagamentos, preferências, segurança e suporte;
- pedidos e reconciliação da organização;
- produção e estoque;
- scanner de retirada;
- financeiro e ledger;
- usuários, convites e papéis;
- logs de atividade;
- fechamento com JSON canônico e simulação de adulteração do hash.
- seletor de tema Claro/Noturno com persistência local.

Não recriar uma superfície estática paralela. Novas features devem entrar em `web/`.

## CRUD real preparado

O app já possui route handlers para CRUD final:

- comprador: perfil, preferências, pedidos e cancelamento;
- dono: organização, campanha, produto, conciliação manual, retirada e fechamento;
- auditoria: eventos gravados em `audit_events`;
- segurança: service role apenas no servidor e Bearer token vindo da sessão Supabase.

Ver detalhes em `docs/crud-flows.md`.

## Setup obrigatório

- Rodar a aplicação em `web/`.
- Copiar `web/.env.example` para `web/.env.local`.
- Seguir `docs/setup.md` para Supabase, Storage, Pix e Solana.
- Executar `supabase/schema.sql` no projeto Supabase antes de desligar mocks.
- Manter `NEXT_PUBLIC_ENABLE_MOCKS=true` até Auth, RLS e webhooks estarem testados.

O marketplace local existe para facilitar descoberta e compra no campus. Ele não muda o posicionamento do produto: CampusPay continua sendo infraestrutura de campanha e prestação verificável, não um marketplace nacional genérico.

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

1. Preencher envs e executar schema Supabase.
2. Validar Auth e CRUD pelos formulários existentes.
3. Substituir cards/tabelas mockadas por queries reais.
4. Formalizar state machines de campanha, pedido e pagamento.
5. Refinar ledger transacional com idempotência forte.
6. Adapter Solana + reconciliação real.
7. Adapter Pix real.
8. Produção/estoque persistidos.
9. QR fulfillment com câmera.
10. Observabilidade, segurança e E2E.

## Definition of Done resumida

Uma feature não está pronta sem autorização backend, validação, estado de falha,
auditabilidade, teste, observabilidade e confirmação de que não expõe PII.
