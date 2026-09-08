# Documentacao CampusPay

Esta pasta foi organizada para avaliadores do Hackathon Universitario da Superteam Brasil, para o time de desenvolvimento e para qualquer pessoa que queira auditar a proposta tecnica do MVP.

A CampusPay e uma plataforma para organizacoes estudantis criarem campanhas verificaveis de pre-venda, pagamento, producao, retirada e prestacao de contas. O foco nao e ser apenas uma loja online: o diferencial e registrar o ciclo completo da campanha ate um relatorio publico verificavel com apoio da Solana.

## Leitura recomendada para avaliadores

1. [Resumo executivo](./executive-summary.md): visao de negocio, problema, solucao, MVP entregue e diferencial.
2. [Mapa dos criterios](./evaluation-map.md): como a proposta responde aos criterios oficiais do hackathon.
3. [Guia de demonstracao](./demo-guide.md): roteiro para testar as principais jornadas da aplicacao.
4. [Arquitetura tecnica](./architecture.md): stack, rotas, Supabase, Solana, seguranca e separacao entre onchain/offchain.
5. [Setup do MVP](./setup.md): passo a passo para rodar localmente e configurar Supabase/Solana.

## Documentos por tema

| Documento | Quando ler |
|---|---|
| [Resumo executivo](./executive-summary.md) | Para entender o projeto em uma pagina. |
| [Mapa dos criterios](./evaluation-map.md) | Para avaliar aderencia ao hackathon. |
| [Guia de demonstracao](./demo-guide.md) | Para navegar pelo MVP com uma trilha coesa. |
| [Visao de negocio](./business.md) | Para entender publico, dor, proposta de valor e modelo futuro. |
| [Requisitos do MVP](./mvp-requirements.md) | Para ver o escopo funcional aprovado e o que ja foi implementado. |
| [Fluxos de usuarios e CRUD](./crud-flows.md) | Para entender comprador, dono de campanha, permissoes e endpoints. |
| [Arquitetura tecnica](./architecture.md) | Para entender stack, banco, storage, auth, Solana e regras de engenharia. |
| [Setup do MVP](./setup.md) | Para configurar `.env.local`, Supabase, buckets, wallet Devnet e testes manuais. |
| [Seguranca e privacidade](./security-and-privacy.md) | Para entender RLS, service role, PII, auditoria e riscos. |
| [Roteiro do pitch](./pitch.md) | Para gravar o video de ate 5 minutos. |
| [Roadmap](./roadmap.md) | Para ver proximos passos apos o hackathon. |

## Estado do MVP

O codigo principal esta em `web/` e foi implementado como uma aplicacao Next.js com TypeScript. Ele possui:

- area de gestao da organizacao em `/app`;
- marketplace local por campus em `/campus/:slug`;
- checkout publico de campanha em `/c/:campaignSlug`;
- conta do comprador em `/me`;
- relatorio publico em `/reports/:publicId`;
- login/cadastro via Supabase Auth;
- protecao de rotas privadas;
- CRUD por APIs internas;
- modo claro e noturno;
- modo mock opcional para demo offline;
- integracao preparada com Supabase Postgres, Supabase Storage, Pix mock e Solana Devnet.

O fluxo-alvo do MVP e:

```text
criar campanha -> aprovar -> vender -> confirmar pagamento -> produzir -> retirar com QR/PIN -> fechar -> verificar relatorio
```

## Como rodar rapidamente

```powershell
cd web
copy .env.example .env.local
npm install
npm run dev
```

Acesse `http://localhost:3000`.

Para rodar com banco real, siga o [Setup do MVP](./setup.md) e troque `NEXT_PUBLIC_ENABLE_MOCKS=false`.

## Observacoes importantes

- O arquivo `.env.local` nao deve ser commitado.
- A `SUPABASE_SERVICE_ROLE_KEY` deve existir somente no servidor ou ambiente de deploy.
- O Pix real ainda depende de um PSP. No hackathon, o adaptador recomendado e `PIX_PROVIDER=mock`.
- A Solana deve ser usada em Devnet durante a avaliacao.
- Dados pessoais nao devem ir para blockchain, memo publico, logs publicos ou relatorio publico.

