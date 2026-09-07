# CampusPay — contexto técnico para agentes

Leia também:

- `PRODUCT_CONTEXT.md`
- `DEVELOPER_HANDOFF.md`
- `FINAL_MVP_CONTEXT.md`
- `docs/architecture.md`
- `docs/mvp-requirements.md`

## Estado atual do repositório

O repositório contém a aplicação principal em `web/`: MVP final em Next.js/TypeScript, com rotas reais, dados mockados por padrão e pontos de integração Supabase/Solana.

A versão principal para desenvolvimento é `web/`. Ela já valida:

- separação real entre Gestão, Marketplace, Minha conta e Auditoria pública;
- modo claro/noturno com preferência salva no navegador;
- visão geral da campanha;
- criação/aprovação versionada;
- marketplace local por campus;
- checkout público;
- conta do comprador;
- QR de retirada do estudante;
- pedidos e reconciliação;
- produção e estoque;
- retirada com QR;
- financeiro e ledger;
- usuários, convites e papéis;
- logs de atividade;
- relatório e verificador de hash com simulação de adulteração.

Não assumir que já existe backend real. O app usa mocks para demo e deve ser ligado a Supabase/Solana pelos contratos documentados.

## Stack alvo aprovada

- Next.js com TypeScript.
- Supabase Auth.
- Supabase Postgres.
- Supabase Storage.
- Supabase RLS.
- Server Actions ou Route Handlers para regras sensíveis.
- Solana Devnet.
- Vercel ou deploy equivalente.

## Implementação atual em `web/`

- Next.js App Router.
- TypeScript strict.
- CSS global com tokens claro/noturno.
- `web/.env.example` com todas as variáveis do MVP.
- `web/lib/env.ts` centraliza leitura de envs públicas.
- `web/lib/supabase-browser.ts` cria client Supabase no browser quando envs existem.
- `web/lib/solana.ts` gera URL Solana Pay e link do explorer.
- `web/lib/report.ts` gera JSON canônico e hash SHA-256 server-side.
- `web/lib/mock-data.ts` guarda dados de demo.
- `web/lib/api-server.ts` centraliza Bearer token, Supabase service role, RBAC e audit log.
- `web/lib/api-client.ts` adiciona sessão Supabase nas chamadas client-side.
- `supabase/schema.sql` define schema inicial, enums, buckets e RLS base.

## CRUD/API implementados

- Auth client-side em `/login`.
- `GET/PUT /api/me/profile`.
- `GET/POST /api/organizations`.
- `GET /api/memberships`.
- `POST /api/invites`.
- `GET/POST /api/campaigns`.
- `GET/PATCH/DELETE /api/campaigns/:id`.
- `GET/POST /api/products`.
- `GET/PATCH/DELETE /api/products/:id`.
- `GET/POST /api/orders`.
- `GET/PATCH/DELETE /api/orders/:code`.
- `POST /api/payments/confirm`.
- `POST /api/fulfillments/confirm`.
- `POST /api/reports`.

Deletes preservam histórico:

- campanha vira `cancelled`;
- pedido vira `cancelled`;
- produto arquiva/desativa variantes.

Fluxos documentados em `docs/crud-flows.md`.

## Arquitetura alvo

```text
Next.js App
  - Área Gestão
    - Dashboard da organização
    - Criação e aprovação de campanha
    - Pedidos e reconciliação
    - Produção e estoque
    - Scanner de retirada
    - Financeiro e ledger
    - Usuários, convites, papéis e logs
    - Relatório final
  - Área Marketplace
    - Descoberta de campanhas por campus
    - Checkout público
    - QR de retirada do comprador
    - Minha conta
  - Área pública/auditoria
    - Relatório público
    - Verificador de hash

Next.js Server
  - Auth/RBAC
  - Marketplace Service
  - Campaign Service
  - Order Service
  - Payment Service
  - Ledger Service
  - Inventory Service
  - Fulfillment Service
  - Report Service
  - Solana Service

Supabase
  - Auth
  - Postgres
  - Storage
  - RLS

Solana Devnet
  - payment reference por pedido
  - âncora do hash do relatório
```

## Supabase

### Buckets

- `product-images`: imagens dos produtos. Pode ser público para campanhas abertas.
- `documents`: documentos financeiros privados. Usar signed URLs com expiração.

### Tabelas iniciais

- `users`
- `buyer_profiles`
- `user_preferences`
- `organizations`
- `organization_memberships`
- `organization_invites`
- `mandates`
- `campaigns`
- `campaign_versions`
- `campaign_approvals`
- `products`
- `product_variants`
- `orders`
- `order_items`
- `payment_intents`
- `payments`
- `ledger_transactions`
- `ledger_entries`
- `expenses`
- `documents`
- `production_batches`
- `inventory_movements`
- `pickup_windows`
- `fulfillments`
- `report_snapshots`
- `blockchain_anchors`
- `audit_events`

### Regras de acesso

- Toda entidade operacional deve ter `organization_id` ou derivar inequivocamente dele.
- IDs públicos não concedem permissão.
- RLS deve reforçar o isolamento multi-tenant.
- A regra definitiva de autorização fica no backend.
- Compradores só acessam seus próprios pedidos.
- Compradores só editam a própria conta e preferências.
- Membros só acessam organizações em que tenham papel ativo.
- Auditores veem relatórios e documentos permitidos, sem PII desnecessária.

## Rotas implementadas do front-end

As jornadas já estão separadas:

- `/app`: visão geral da organização.
- `/app/campaigns/:id`: campanha.
- `/app/orders`: pedidos e reconciliação.
- `/app/inventory`: produção e estoque.
- `/app/pickup`: scanner de retirada.
- `/app/finance`: financeiro e ledger.
- `/app/users`: usuários e papéis.
- `/app/logs`: logs de atividade.
- `/app/reports/:id`: fechamento.
- `/campus/:slug`: marketplace local.
- `/c/:campaignSlug`: checkout público.
- `/me`: conta do comprador.
- `/me/orders`: pedidos do comprador.
- `/me/pickups/:orderCode`: QR/PIN de retirada.
- `/reports/:publicId`: relatório público/verificador.

O MVP principal em `web/` não mistura navegação administrativa com a jornada pública do comprador.

## Tema visual

- O front atual em `web/` oferece tema claro e noturno.
- A preferência local usa `localStorage` com a chave `campuspay-theme`.
- A implementação em Next.js deve aplicar o tema cedo para evitar flash visual.
- Usuário autenticado deve poder persistir a preferência em `user_preferences`; antes do login, usar fallback local.
- Ambos os temas precisam manter contraste legível em gestão, marketplace, conta do comprador e relatório.

## Fronteira client/server

Pode ficar no cliente:

- navegação;
- seleção de variante;
- preview de imagem;
- leitura de dados públicos de campanha;
- estados visuais;
- fluxo de checkout.
- filtros e ordenação do marketplace quando baseados em dados já públicos.
- edição local de preferências antes de salvar.

Deve passar pelo servidor:

- criação e aprovação de campanha;
- convite e alteração de papel de usuário;
- geração de payment intent;
- confirmação de pagamento;
- processamento de webhook;
- reconciliação Solana;
- lançamentos de ledger;
- upload autorizado para buckets privados;
- confirmação de retirada;
- fechamento de relatório;
- cálculo de hash;
- ancoragem onchain;
- audit events.
- leitura/escrita de dados pessoais do comprador.

## Solana

### Hackathon/MVP

Usar Solana para:

- pagamento com reference única por pedido;
- registro/âncora do hash do relatório final na Devnet.

No Solana Pay, a reference precisa ser uma public key base58 única, gerada no servidor. Não usar texto `CPAY-*` como reference onchain. A referência humana fica offchain.

Não criar:

- token próprio;
- NFT decorativo;
- DAO artificial;
- escrow custodial.

### Validação obrigatória

Nunca confiar apenas na assinatura retornada pelo cliente. O servidor deve validar:

- transação existente;
- confirmação/finalidade;
- recipient correto;
- mint correto;
- valor em base units;
- reference correta;
- ausência de processamento anterior;
- contas e programas esperados.

## Ledger e idempotência

- Valores monetários sempre em inteiros.
- Toda transação de ledger deve balancear.
- Eventos financeiros aceitam idempotency key.
- Correções acontecem por reversão.
- Nenhum lançamento confirmado deve ser apagado fisicamente.

## Privacidade

- Nenhuma PII onchain.
- Nenhuma PII em memo público.
- Evitar PII em logs.
- QR/PIN não contém dados pessoais em claro.
- Relatório público usa agregados e hashes.
- Documentos financeiros ficam privados.

## Ordem recomendada para próximos agentes

1. Revisar `docs/setup.md` e preencher `web/.env.local`.
2. Executar `supabase/schema.sql` em um projeto Supabase.
3. Testar `/login`, `/app/users`, `/app/campaigns/new`, `/c/:slug`, `/app/orders`, `/app/pickup` e `/app/reports/:id`.
4. Trocar visões analíticas restantes por queries reais do piloto.
5. Implementar webhooks/adapter Pix real.
6. Implementar watcher/validador Solana real.
7. Refinar transações de ledger e garantias de atomicidade.
8. Adicionar scanner de câmera para QR.
9. Adicionar testes E2E multi-tenant.
10. Preparar deploy.

## Critério de qualidade

Antes de concluir qualquer tarefa, responder:

1. Qual dor concreta da campanha isso resolve?
2. Qual dado fica onchain e qual fica offchain?
3. Como a ação aparece no relatório final?
4. Existe risco de duplicidade por retry?
5. Existe risco de vazamento de PII?
6. Existe risco de acesso entre organizações?
