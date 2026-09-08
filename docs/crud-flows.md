# Fluxos de usuários e CRUD

Este documento descreve como compradores e donos de campanha operam a versão final do MVP em `web/`.

## Criação de usuário

Usuários são criados via Supabase Auth na rota `/login`.

Fluxo:

1. O usuário abre `/login`.
2. Informa e-mail e senha.
3. O componente `AuthPanel` chama `supabase.auth.signUp` ou `supabase.auth.signInWithPassword`.
4. O Supabase cria o registro em `auth.users`.
5. O trigger `public.handle_new_user` cria:
   - `profiles`;
   - `user_preferences`.
6. A sessão do Supabase fica no navegador.
7. As chamadas para `/api/*` enviam `Authorization: Bearer <access_token>`.

Com `NEXT_PUBLIC_ENABLE_MOCKS=false`, as rotas `/app/*` e `/me/*` exigem sessão no navegador e redirecionam para `/login?next=...`.

Uma mesma conta pode ser comprador e membro de organização. O que muda é a existência de registros em `organization_memberships`.

## Comprador

### Create

- Criar conta em `/login`.
- Completar dados em `/me`.
- Criar pedido em `/c/:campaignSlug`.

Endpoints:

- `PUT /api/me/profile`
- `POST /api/orders`

### Read

- Ver dados de conta em `/me`.
- Ver pedidos em `/me/orders`.
- Ver pedido específico em `/api/orders/:code`.
- Ver retirada em `/me/pickups/:orderCode`.

Endpoints:

- `GET /api/me/profile`
- `GET /api/orders?scope=buyer`
- `GET /api/orders/:code`

### Update

- Atualizar dados de comprador em `/me`.
- Atualizar/cancelar pedido enquanto a regra permitir.

Endpoints:

- `PUT /api/me/profile`
- `PATCH /api/orders/:code`

### Delete

Não há exclusão física de pedido. O botão de cancelar usa soft delete operacional:

- `DELETE /api/orders/:code` altera `orders.status` para `cancelled`.

Isso preserva auditoria, ledger e relatório.

## Dono ou gestor de campanha

### Create

- Criar conta em `/login`.
- Criar organização em `/app/users`.
- A API cria `organization_memberships` com papel `owner`.
- Criar campanha/produto em `/app/campaigns/new`.
- Subir foto do produto em `/app/campaigns/:id`.
- Criar convite de membro em `/app/users`.

Endpoints:

- `POST /api/organizations`
- `POST /api/campaigns`
- `POST /api/products`
- `POST /api/invites`

### Read

- Ver dashboard em `/app`.
- Ver campanha em `/app/campaigns/:id`.
- Ver pedidos em `/app/orders`.
- Ver produção/estoque em `/app/inventory`.
- Ver retirada em `/app/pickup`.
- Ver financeiro em `/app/finance`.
- Ver membros em `/app/users`.
- Ver logs em `/app/logs`.
- Ver fechamento em `/app/reports/:id`.

Endpoints:

- `GET /api/organizations`
- `GET /api/memberships`
- `GET /api/campaigns`
- `GET /api/campaigns/:id`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/orders?scope=organization`

### Update

- Atualizar status de campanha em `/app/campaigns/:id`.
- Atualizar produto e imagem em `/app/campaigns/:id`.
- Confirmar pagamento em `/app/orders`.
- Confirmar retirada em `/app/pickup`.
- Gerar relatório em `/app/reports/:id`.

Endpoints:

- `PATCH /api/campaigns/:id`
- `PATCH /api/products/:id`
- `POST /api/payments/confirm`
- `POST /api/fulfillments/confirm`
- `POST /api/reports`

### Delete

Não há exclusão física de campanha/produto.

- `DELETE /api/campaigns/:id` muda status para `cancelled`.
- `DELETE /api/products/:id` desativa variantes do produto.

Essa decisão evita perda de histórico e mantém compatibilidade com prestação de contas.

## Segurança

- Service role só é usada em Route Handlers do servidor.
- Cliente nunca recebe service role.
- Endpoints sensíveis exigem Bearer token ou webhook secret.
- RBAC é checado contra `organization_memberships`.
- Solana Pay usa public key base58 como `payment_intents.reference`.
- A referência humana do pedido fica offchain em `provider_payload.orderReference`.
- Comprador só acessa seus pedidos.
- Membro só acessa organização em que participa.
- PII não entra em Solana, memo ou relatório público.

## Modo mock

Com `NEXT_PUBLIC_ENABLE_MOCKS=true`, as rotas retornam respostas simuladas para demo sem Supabase.

Com `NEXT_PUBLIC_ENABLE_MOCKS=false`, as APIs exigem:

- Supabase URL;
- publishable key;
- service role key;
- schema aplicado;
- usuário autenticado para ações privadas.
