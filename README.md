# CampusPay

MVP da CampusPay para o Hackathon Universitário da Superteam Brasil.

A versão principal agora está em `web/`: uma aplicação Next.js/TypeScript com rotas reais, dados mockados por padrão, modo claro/noturno e pontos de integração para Supabase, Supabase Storage, Pix e Solana Devnet.

`criar campanha → aprovar → vender → reconciliar pagamento → produzir → retirar com QR → fechar relatório → verificar hash`

## Como rodar o MVP

```powershell
cd web
copy .env.example .env.local
npm install
npm run dev
```

Depois acesse:

- `http://localhost:3000/app` para a área de gestão.
- `http://localhost:3000/campus/inteli-sp` para o marketplace local.
- `http://localhost:3000/c/camisa-atletica-2026` para o checkout público.
- `http://localhost:3000/me` para a conta do comprador.
- `http://localhost:3000/reports/rel-camiseta-2026` para o relatório público.

Fluxo público validado: o marketplace em `/campus/:slug` lista campanhas publicadas por API, o botão de compra abre `/c/:campaignSlug`, e o checkout cria pedido em `/api/orders`.

## Configuração rápida

Por padrão, `NEXT_PUBLIC_ENABLE_MOCKS=true` permite rodar sem backend. Para ligar integrações reais:

1. Crie um projeto Supabase.
2. Rode `supabase/schema.sql` no SQL Editor.
3. Preencha `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e, no servidor, `SUPABASE_SERVICE_ROLE_KEY`.
4. Confirme os buckets `product-images` e `documents`.
5. Configure uma wallet de tesouraria na Solana Devnet e preencha `NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS`.
6. Troque `NEXT_PUBLIC_ENABLE_MOCKS=false` quando quiser testar com serviços reais.

O passo a passo completo está em `docs/setup.md`.

## Usuários e CRUD

Usuários reais são criados em `/login` via Supabase Auth. Depois:

- comprador completa perfil em `/me`, compra em `/c/camisa-atletica-2026`, acompanha pedidos em `/me/orders` e QR em `/me/pickups/:orderCode`;
- dono cria organização em `/app/users`, cria convites, cria campanha/produto em `/app/campaigns/new`, publica status, opera pedidos, pagamentos, retirada e relatório nas rotas `/app/*`.

O contrato completo está em `docs/crud-flows.md`.

## Estado atual

- `web/`: MVP final em Next.js, pronto para configuração de envs.
- `supabase/schema.sql`: schema inicial, buckets e políticas base.
- `docs/`: documentação de negócio, produto, arquitetura, setup e roadmap.
- `.context/`: contexto mestre usado por pessoas e agentes de desenvolvimento.

## Estrutura

- `web/`: aplicação final do MVP.
- `supabase/`: schema SQL inicial.
- `docs/`: documentação de negócio, produto, arquitetura e roadmap.
- `.context/`: contexto mestre usado por pessoas e agentes de desenvolvimento.
