# CampusPay — contexto da versão final do MVP

Atualizado em: 08 de setembro de 2026.

## Superfície principal

Use `web/` como aplicação principal.

## Como rodar

```powershell
cd web
copy .env.example .env.local
npm install
npm run dev
```

Rotas de validação:

- `/app`
- `/app/campaigns/new`
- `/app/campaigns/:id`
- `/app/orders`
- `/app/inventory`
- `/app/pickup`
- `/app/finance`
- `/app/users`
- `/app/logs`
- `/app/reports/latest`
- `/app/reports/:publicId`
- `/campus/inteli-sp`
- `/c/:campaignSlug`
- `/me`
- `/me/orders`
- `/reports/:publicId`

## O que já existe

- Next.js App Router com TypeScript.
- Tema claro/noturno com `localStorage`.
- Dados mockados centralizados em `web/lib/mock-data.ts`.
- Helper de envs em `web/lib/env.ts`.
- Login/cadastro por Supabase Auth em `/login`.
- APIs CRUD para comprador, organização, campanha, produto e pedido.
- API de convites de membros em `/api/invites`.
- APIs sensíveis para confirmação de pagamento, retirada e relatório.
- Upload de imagem em `web/components/product-image-uploader.tsx`, com persistência da URL no produto quando Supabase está ligado.
- Marketplace por campus em `web/components/campus-campaign-list.tsx`, alimentado por `/api/campaigns`.
- Checkout Pix/Solana em `web/components/checkout-card.tsx`, alimentado por `/api/campaigns` e `/api/products`, com fallback mock apenas quando `NEXT_PUBLIC_ENABLE_MOCKS=true`.
- Leituras reais de gestão em `/api/management/overview`, `/api/inventory`, `/api/finance`, `/api/audit-events` e `/api/reports/:publicId`.
- `AuthGate` protegendo `/app/*` e `/me/*` quando mocks estão desligados.
- URL Solana Pay gerada em `web/lib/solana.ts`.
- Reference Solana gerada como public key base58 em `web/lib/server-hash.ts`.
- JSON canônico e SHA-256 em `web/lib/report.ts`.
- Verificador de hash em `web/components/hash-verifier.tsx`.
- Schema Supabase inicial em `supabase/schema.sql`.
- Setup completo em `docs/setup.md`.

## Modo mock

`NEXT_PUBLIC_ENABLE_MOCKS=true` mantém tudo funcionando sem backend.

Para sair do mock:

1. Rodar `supabase/schema.sql`.
2. Configurar Supabase Auth.
3. Preencher `web/.env.local`.
4. Criar wallet de tesouraria Devnet.
5. Preencher `NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS`.
6. Trocar `NEXT_PUBLIC_ENABLE_MOCKS=false`.
7. Validar os fluxos reais: campus -> checkout -> pedido -> pagamento -> retirada -> relatório.

Observação: os route handlers já existem para os fluxos principais e as telas finais deixam de renderizar dados demo quando `NEXT_PUBLIC_ENABLE_MOCKS=false`. O próximo trabalho é refinar regras específicas do piloto, webhooks Pix, watcher Solana e formulários operacionais avançados.

## Fronteiras obrigatórias

- Comprador não usa a área `/app`.
- Organização não usa a jornada `/me` para operar campanha.
- Relatório público não expõe PII.
- Fotos de produto podem ficar em bucket público.
- Documentos financeiros ficam no bucket privado `documents`.
- Service role nunca vai para componente client.
- Nenhum dado pessoal vai para memo, Solana ou logs públicos.
- Não usar código humano `CPAY-*` como Solana Pay reference.
- Toda confirmação financeira real precisa ser idempotente.
- Ledger confirmado é corrigido por reversão, nunca por update destrutivo.

## Próxima task recomendada

Validar o E2E com o Supabase real do time: login, organização, campanha, marketplace, checkout, confirmação de pagamento, retirada e relatório.
