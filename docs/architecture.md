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

O MVP principal está implementado em `web/`, mantendo o repositório focado na aplicação final.

## Implementação atual

```text
web/
  app/
    app/                    rotas de gestão da organização
    campus/[slug]/          marketplace local
    c/[campaignSlug]/       checkout público
    me/                     conta e pedidos do comprador
    reports/[publicId]/     relatório público e verificador
    api/health              status de integrações
    api/payments/solana-url helper de URL Solana Pay
    api/*                   CRUD e operações sensíveis do MVP
  components/
    navigation              navegação por área
    checkout-card           checkout Pix/Solana via API, com fallback mock
    campus-campaign-list    vitrine pública alimentada por campanha/produto
    hash-verifier           verificação client-side de hash
    product-image-uploader  upload para Supabase Storage com fallback local
    theme-toggle            claro/noturno por localStorage
  lib/
    env                     leitura segura de envs públicas
    api-client              fetch autenticado a partir da sessão Supabase
    api-server              auth/RBAC/audit para route handlers
    mock-data               dados de demonstração
    report                  JSON canônico e SHA-256 server-side
    solana                  helpers Solana Pay e explorer
    supabase-browser        client Supabase browser-side

supabase/
  schema.sql                schema inicial, buckets e RLS base
```

Os mocks continuam disponíveis para demo offline. Com `NEXT_PUBLIC_ENABLE_MOCKS=false`, as rotas públicas de marketplace/checkout e as telas de gestão passam por route handlers com Supabase, sem renderizar dados de demonstração.

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
    - Usuários, papéis e logs
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

### Banco

Supabase Postgres armazena as entidades operacionais:

- users;
- buyer_profiles;
- user_preferences;
- organizations;
- organization_memberships;
- organization_invites;
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

As telas de marketplace devem derivar de `campaigns`, `products`, `product_variants` e regras de visibilidade por campus. Não criar uma lógica separada de marketplace que duplique o estado da campanha.

### Storage

Buckets recomendados:

- `product-images`: imagens públicas ou semipúblicas dos produtos da campanha.
- `documents`: documentos privados, como orçamentos, recibos e comprovantes.

Fotos de produto podem ser servidas publicamente quando a campanha estiver aberta. Documentos financeiros devem usar URLs assinadas com expiração.

### RLS

As tabelas precisam considerar multi-tenancy por `organization_id`. IDs públicos não concedem autorização.

Regras mínimas:

- comprador acessa apenas seus pedidos;
- comprador acessa e edita apenas sua própria conta;
- membros acessam apenas organizações onde possuem papel ativo;
- auditor acessa relatórios e documentos permitidos;
- suporte da plataforma não movimenta fundos;
- operações financeiras sensíveis passam pelo servidor.

## Front-end

A aplicação final do MVP em `web/` separa as experiências em rotas reais:

- `/app`: gestão da organização.
- `/campus/:slug`: marketplace local.
- `/c/:campaignSlug`: checkout público.
- `/me`: conta do comprador.
- `/reports/:publicId`: auditoria pública.

Também existe preferência visual de tema:

- `light`: tema claro padrão.
- `dark`: tema noturno.

Na aplicação `web/`, a preferência local usa a chave `campuspay-theme` e aplica o tema antes do render para evitar flash visual. Com Supabase Auth, a tabela `user_preferences` deve persistir essa preferência por usuário.

Rotas implementadas:

- `/app`: visão geral da organização.
- `/app/campaigns/:id`: campanha.
- `/app/orders`: pedidos e reconciliação.
- `/app/inventory`: produção e estoque.
- `/app/pickup`: scanner de retirada.
- `/app/finance`: financeiro e ledger.
- `/app/users`: usuários, convites e papéis.
- `/app/logs`: logs.
- `/app/reports/:id`: fechamento.
- `/campus/:slug`: marketplace local.
- `/c/:campaignSlug`: página pública/checkout.
- `/me`: conta do comprador.
- `/me/orders`: pedidos do comprador.
- `/me/pickups/:orderCode`: QR/PIN de retirada.
- `/reports/:publicId`: relatório público/verificador.

As jornadas administrativas, públicas e do comprador devem continuar separadas para não misturar permissões, dados e linguagem por público.

## Configuração

`web/.env.example` lista todas as variáveis necessárias. O guia completo está em `docs/setup.md`.

Os nomes principais são:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
- `SUPABASE_SERVICE_ROLE_KEY`;
- `NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET`;
- `NEXT_PUBLIC_SOLANA_CLUSTER`;
- `NEXT_PUBLIC_SOLANA_RPC_URL`;
- `NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS`;
- `NEXT_PUBLIC_SOLANA_USDC_MINT`;
- `PIX_PROVIDER`;
- `PIX_WEBHOOK_SECRET`.

`NEXT_PUBLIC_ENABLE_MOCKS=true` mantém a aplicação em modo demo. Para testes reais, preencher Supabase/Solana e trocar para `false`.

## CRUD e autorização

Usuários são criados em `/login` via Supabase Auth. O trigger `handle_new_user` cria `profiles` e `user_preferences`.

O comprador opera:

- perfil em `/me`;
- descoberta em `/campus/:slug`;
- pedido no checkout `/c/:campaignSlug`;
- leitura/cancelamento dos próprios pedidos com escopo de comprador;
- QR/PIN de retirada.

O dono opera:

- organização;
- campanha, status e publicação;
- produto e imagem persistida no Storage/DB;
- pedidos com escopo de organização;
- pagamento;
- retirada;
- convite de membros;
- relatório.

Operações sensíveis passam por route handlers com Bearer token, service role server-side, RBAC por `organization_memberships` e `audit_events`.

## Solana

### MVP de hackathon

Usar Solana para duas provas claras:

1. pagamento com reference única por pedido;
2. hash do relatório final ancorado na Devnet.

No Solana Pay, `payment_intents.reference` deve ser uma public key base58 única. O código humano do pedido não deve ser usado como reference onchain; ele fica como metadado offchain.

### Validação de pagamento

O backend deve validar:

- transação confirmada;
- recipient correto;
- mint correto;
- valor em base units;
- reference Solana base58 vinculada ao pedido;
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

