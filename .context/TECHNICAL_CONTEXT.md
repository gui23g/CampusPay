# CampusPay — contexto técnico para agentes

Leia também:

- `PRODUCT_CONTEXT.md`
- `DEVELOPER_HANDOFF.md`
- `docs/architecture.md`
- `docs/mvp-requirements.md`

## Estado atual do repositório

O repositório contém uma versão visual de alta fidelidade em `app/`, sem backend. Ela é uma SPA estática com dados mockados para validar:

- visão geral da campanha;
- criação/aprovação versionada;
- checkout público;
- pedidos e reconciliação;
- produção e estoque;
- retirada com QR;
- financeiro e ledger;
- relatório e verificador de hash com simulação de adulteração.

Não assumir que o protótipo atual já tem backend real. Ele representa a experiência esperada e deve servir como referência para migração para Next.js.

## Stack alvo aprovada

- Next.js com TypeScript.
- Supabase Auth.
- Supabase Postgres.
- Supabase Storage.
- Supabase RLS.
- Server Actions ou Route Handlers para regras sensíveis.
- Solana Devnet.
- Vercel ou deploy equivalente.

## Arquitetura alvo

```text
Next.js App
  - Dashboard da organização
  - Criação e aprovação de campanha
  - Checkout público
  - Upload de imagem de produto
  - Scanner de retirada
  - Relatório final
  - Verificador de hash

Next.js Server
  - Auth/RBAC
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
- `organizations`
- `organization_memberships`
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
- Membros só acessam organizações em que tenham papel ativo.
- Auditores veem relatórios e documentos permitidos, sem PII desnecessária.

## Fronteira client/server

Pode ficar no cliente:

- navegação;
- seleção de variante;
- preview de imagem;
- leitura de dados públicos de campanha;
- estados visuais;
- fluxo de checkout.

Deve passar pelo servidor:

- criação e aprovação de campanha;
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

## Solana

### Hackathon/MVP

Usar Solana para:

- pagamento com reference única por pedido;
- registro/âncora do hash do relatório final na Devnet.

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

1. Migrar protótipo estático para Next.js.
2. Definir tema, componentes e layout base.
3. Criar schema Supabase inicial.
4. Implementar Auth e RBAC.
5. Implementar campanhas e produtos com upload de imagem.
6. Implementar checkout mockado.
7. Implementar ledger local.
8. Implementar QR fulfillment.
9. Implementar report snapshot e hash.
10. Integrar Solana Devnet.

## Critério de qualidade

Antes de concluir qualquer tarefa, responder:

1. Qual dor concreta da campanha isso resolve?
2. Qual dado fica onchain e qual fica offchain?
3. Como a ação aparece no relatório final?
4. Existe risco de duplicidade por retry?
5. Existe risco de vazamento de PII?
6. Existe risco de acesso entre organizações?
