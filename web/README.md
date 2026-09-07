# CampusPay Web

Aplicação final do MVP, construída em Next.js e pronta para ligar Supabase, Supabase Storage e Solana Devnet.

## Rodar localmente

```powershell
cd web
copy .env.example .env.local
npm install
npm run dev
```

Depois acesse `http://localhost:3000`.

Por padrão, `NEXT_PUBLIC_ENABLE_MOCKS=true` mantém a aplicação rodando com dados de demonstração. Para testar Supabase real, preencha as variáveis e troque para `false`.

## Rotas principais

- `/login`: cadastro/login via Supabase Auth.
- `/app`: visão geral da organização.
- `/app/campaigns/new`: criar campanha/produto reais via API.
- `/app/campaigns/camiseta-2026`: campanha, produto e upload de imagem.
- `/app/orders`: pedidos e conciliação.
- `/app/inventory`: produção e estoque.
- `/app/pickup`: retirada com QR/PIN.
- `/app/finance`: ledger e resultado.
- `/app/users`: membros, convites e papéis.
- `/app/logs`: auditoria.
- `/app/reports/camiseta-2026`: fechamento interno.
- `/campus/inteli-sp`: marketplace local.
- `/c/camisa-atletica-2026`: checkout público.
- `/me`: conta do comprador.
- `/me/orders`: pedidos do comprador.
- `/reports/rel-camiseta-2026`: relatório público.

## Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Rode `../supabase/schema.sql`.
4. Copie Project URL e Publishable key para `.env.local`.
5. Confirme que os buckets `product-images` e `documents` existem em Storage.

## CRUD implementado

- Auth: `/login` usa `supabase.auth.signUp` e `supabase.auth.signInWithPassword`.
- Comprador: `GET/PUT /api/me/profile`, `GET/POST /api/orders`, `GET/PATCH/DELETE /api/orders/:code`.
- Organização: `GET/POST /api/organizations`.
- Convites: `POST /api/invites`.
- Campanha: `GET/POST /api/campaigns`, `GET/PATCH/DELETE /api/campaigns/:id`.
- Produto: `GET/POST /api/products`, `GET/PATCH/DELETE /api/products/:id`.
- Pagamento: `POST /api/payments/confirm`.
- Retirada: `POST /api/fulfillments/confirm`.
- Relatório: `POST /api/reports`.

Deletes são soft deletes ou arquivamentos para preservar trilha de auditoria.

O fluxo público principal é real dentro da aplicação: `/campus/:slug` carrega campanhas publicadas por API, cada campanha leva para `/c/:campaignSlug`, e o checkout cria o pedido em `/api/orders`.

## Solana

Use Devnet no MVP:

```powershell
solana config set --url https://api.devnet.solana.com
solana-keygen new
solana address
solana airdrop 2
```

Coloque a public key da tesouraria em `NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS`.
