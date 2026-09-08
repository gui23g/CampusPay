# CampusPay

MVP da CampusPay para o Hackathon Universitário da Superteam Brasil.

A versão principal agora está em `web/`: uma aplicação Next.js/TypeScript com rotas reais, modo mock opcional, modo claro/noturno e integrações para Supabase, Supabase Storage, Pix e Solana Devnet.

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
- `http://localhost:3000/c/:campaignSlug` para o checkout público de uma campanha criada.
- `http://localhost:3000/me` para a conta do comprador.
- `http://localhost:3000/reports/:publicId` para o relatório público gerado no fechamento.

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

Usuários reais são criados em `/login` via Supabase Auth. Com `NEXT_PUBLIC_ENABLE_MOCKS=false`, as rotas `/app/*` e `/me/*` exigem sessão e redirecionam para `/login?next=...`. Depois:

- comprador completa perfil em `/me`, compra pelo fluxo `/campus/:slug` → `/c/:campaignSlug`, acompanha pedidos em `/me/orders` e PIN em `/me/pickups/:orderCode`;
- dono cria organização em `/app/users`, cria convites, cria campanha/produto em `/app/campaigns/new`, publica status, opera pedidos, pagamentos, retirada e relatório nas rotas `/app/*`.

O contrato completo está em `docs/crud-flows.md`.

## Estado atual

- `web/`: MVP final em Next.js, pronto para configuração de envs.
- `supabase/schema.sql`: schema inicial, buckets e políticas base.
- `docs/`: documentação para avaliadores, negócio, demo, arquitetura, setup, segurança e roadmap.
- `.context/`: contexto mestre usado por pessoas e agentes de desenvolvimento.

## Documentação para avaliação

Comece por `docs/README.md`. Os principais documentos para banca são:

- `docs/executive-summary.md`: resumo executivo do projeto.
- `docs/evaluation-map.md`: aderência aos critérios do hackathon.
- `docs/demo-guide.md`: roteiro de navegação e validação do MVP.
- `docs/architecture.md`: arquitetura técnica e integrações.
- `docs/setup.md`: configuração local, Supabase, Storage, Solana e Pix.

## Estrutura

- `web/`: aplicação final do MVP.
- `supabase/`: schema SQL inicial.
- `docs/`: documentação de avaliação, negócio, produto, arquitetura e roadmap.
- `.context/`: contexto mestre usado por pessoas e agentes de desenvolvimento.
