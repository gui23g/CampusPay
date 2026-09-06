# Arquitetura tecnica

## Decisao de stack

Para o MVP funcional, a stack recomendada e:

- Next.js com TypeScript;
- Supabase Auth;
- Supabase Postgres;
- Supabase Storage;
- Supabase Row Level Security;
- Server Actions ou Route Handlers para regras sensiveis;
- Solana Devnet;
- Vercel ou deploy equivalente.

O prototipo atual em `app/` e estatico para acelerar validacao visual.

## Arquitetura alvo

```text
Next.js App
  - Dashboard da organizacao
  - Criacao e aprovacao de campanha
  - Checkout publico
  - Upload de imagem de produto
  - Scanner de retirada
  - Relatorio final
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
  - anchor do hash do relatorio
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

- `product-images`: imagens publicas ou semi-publicas dos produtos da campanha.
- `documents`: documentos privados, como orcamentos, recibos e comprovantes.

Fotos de produto podem ser servidas publicamente quando a campanha estiver aberta. Documentos financeiros devem usar URLs assinadas com expiracao.

### RLS

As tabelas precisam considerar multi-tenancy por `organization_id`. IDs publicos nao concedem autorizacao.

Regras minimas:

- comprador acessa apenas seus pedidos;
- membros acessam apenas organizacoes onde possuem papel ativo;
- auditor acessa relatorios e documentos permitidos;
- suporte da plataforma nao movimenta fundos;
- operacoes financeiras sensiveis passam pelo servidor.

## Solana

### MVP de hackathon

Usar Solana para duas provas claras:

1. pagamento com reference unica por pedido;
2. hash do relatorio final ancorado na Devnet.

### Validacao de pagamento

O backend deve validar:

- transacao confirmada;
- recipient correto;
- mint correto;
- valor em base units;
- reference do pedido;
- ausencia de processamento anterior;
- token account esperado;
- nivel de confirmacao definido.

### Onchain e offchain

Onchain:

- IDs opacos;
- wallet/tesouraria;
- hashes de versao e relatorio;
- totais agregados nao sensiveis;
- assinatura/transacao de referencia.

Offchain:

- nomes;
- contatos;
- pedidos;
- itens individuais;
- documentos;
- dados bancarios;
- disputas;
- logistica.

## Regras de engenharia

- Valores monetarios em inteiros.
- Eventos financeiros idempotentes.
- Ledger balanceado.
- Reversao para correcao.
- Audit event para acoes sensiveis.
- Outbox para eventos criticos na versao backend.
- Sem PII em blockchain, logs ou payload publico.
- Separacao de Devnet e Mainnet por ambiente.

