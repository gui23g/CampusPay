# Arquitetura técnica

## Decisão de stack

Para o MVP funcional, a stack recomendada é:

- Next.js com TypeScript;
- Supabase Auth;
- Supabase Postgres;
- Supabase Storage;
- Supabase Row Level Security;
- Server Actions ou Route Handlers para regras sensíveis;
- Solana Devnet;
- Vercel ou deploy equivalente.

O protótipo atual em `app/` é estático para acelerar a validação visual.

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

### Banco

Supabase Postgres armazena as entidades operacionais:

- users;
- organizations;
- organization_memberships;
- campaigns;
- campaign_versions;
- products;
- product_variants;
- orders;
- order_items;
- payment_intents;
- payments;
- ledger_transactions;
- ledger_entries;
- production_batches;
- inventory_movements;
- pickup_windows;
- fulfillments;
- report_snapshots;
- blockchain_anchors;
- audit_events.

### Storage

Buckets recomendados:

- `product-images`: imagens públicas ou semipúblicas dos produtos da campanha.
- `documents`: documentos privados, como orçamentos, recibos e comprovantes.

Fotos de produto podem ser servidas publicamente quando a campanha estiver aberta. Documentos financeiros devem usar URLs assinadas com expiração.

### RLS

As tabelas precisam considerar multi-tenancy por `organization_id`. IDs públicos não concedem autorização.

Regras mínimas:

- comprador acessa apenas seus pedidos;
- membros acessam apenas organizações onde possuem papel ativo;
- auditor acessa relatórios e documentos permitidos;
- suporte da plataforma não movimenta fundos;
- operações financeiras sensíveis passam pelo servidor.

## Solana

### MVP de hackathon

Usar Solana para duas provas claras:

1. pagamento com reference única por pedido;
2. hash do relatório final ancorado na Devnet.

### Validação de pagamento

O backend deve validar:

- transação confirmada;
- recipient correto;
- mint correto;
- valor em base units;
- reference do pedido;
- ausência de processamento anterior;
- token account esperado;
- nível de confirmação definido.

### Onchain e offchain

Onchain:

- IDs opacos;
- wallet/tesouraria;
- hashes de versão e relatório;
- totais agregados não sensíveis;
- assinatura/transação de referência.

Offchain:

- nomes;
- contatos;
- pedidos;
- itens individuais;
- documentos;
- dados bancários;
- disputas;
- logística.

## Regras de engenharia

- Valores monetários em inteiros.
- Eventos financeiros idempotentes.
- Ledger balanceado.
- Reversão para correção.
- Audit event para ações sensíveis.
- Outbox para eventos críticos na versão backend.
- Sem PII em blockchain, logs ou payload público.
- Separação de Devnet e Mainnet por ambiente.

