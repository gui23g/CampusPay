# Setup do MVP

Este guia liga a aplicação `web/` aos serviços reais do MVP. Ela também roda sem serviços externos quando `NEXT_PUBLIC_ENABLE_MOCKS=true`.

## 1. Rodar localmente

```powershell
cd web
copy .env.example .env.local
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## 2. Variáveis de ambiente

Preencha `web/.env.local` a partir de `web/.env.example`.

| Variável | Onde pegar | O que preencher |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | app local/deploy | `http://localhost:3000` localmente |
| `NEXT_PUBLIC_ENABLE_MOCKS` | decisão do time | `true` para demo, `false` para Supabase/Solana reais |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings ou Connect panel | URL `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase API keys | chave pública/publishable |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | opcional | fallback se o dashboard ainda chamar a chave pública de anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase API keys | service role, somente servidor/deploy |
| `NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET` | Supabase Storage | `product-images` |
| `SUPABASE_DOCUMENTS_BUCKET` | Supabase Storage | `documents` |
| `NEXT_PUBLIC_SOLANA_CLUSTER` | decisão do time | `devnet` no MVP |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Solana RPC | `https://api.devnet.solana.com` para Devnet |
| `NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS` | wallet da organização | public key da tesouraria Devnet |
| `NEXT_PUBLIC_SOLANA_USDC_MINT` | mint SPL de teste | deixe vazio para SOL; preencha para stablecoin/test token |
| `SOLANA_REPORT_ANCHOR_MODE` | implementação backend | `memo` no MVP |
| `SOLANA_REPORT_ANCHOR_PROGRAM_ID` | programa futuro | deixe vazio enquanto usar memo |
| `SOLANA_VALIDATE_TRANSACTIONS` | validação backend | `false` para demo; `true` para exigir assinatura e checar RPC |
| `PIX_PROVIDER` | adapter de Pix | `mock` no hackathon |
| `PIX_WEBHOOK_SECRET` | segredo interno | string longa e aleatória |
| `REPORT_HASH_SALT` | segredo interno | string longa para hardening de snapshots |
| `APP_ADMIN_EMAILS` | operação | e-mails separados por vírgula |

Nunca commite `.env.local`, service role, seed phrase, keypair Solana ou segredo de webhook.

## 3. Supabase

1. Crie um projeto no Supabase.
2. Abra `SQL Editor`.
3. Cole e execute `supabase/schema.sql`.
4. Verifique em `Storage` se os buckets foram criados:
   - `product-images`: público, para fotos de produtos de campanhas abertas.
   - `documents`: privado, para orçamentos, recibos e comprovantes.
5. Em `Authentication`, configure as URLs de redirect:
   - Local: `http://localhost:3000/**`
   - Deploy: `https://seu-dominio/**`
6. Copie a Project URL e a publishable key para `web/.env.local`.
7. Copie a service role key apenas para ambiente server-side.

O upload de imagem da tela `/app/campaigns/:id` funciona como preview local quando mocks estão ligados. Com Supabase preenchido e `NEXT_PUBLIC_ENABLE_MOCKS=false`, o upload envia para o bucket `product-images`.

## 4. Solana Devnet

Use Devnet para o hackathon. Os tokens não têm valor real.

Se `solana` ou `solana-keygen` aparecer como comando não reconhecido, o Solana CLI ainda não está instalado ou não entrou no `PATH`.

Para o MVP, existem dois caminhos:

### Caminho rápido sem CLI

Use uma wallet como Phantom ou Solflare em Devnet e copie a public key dela para:

```env
NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS=sua_public_key_devnet
SOLANA_VALIDATE_TRANSACTIONS=false
```

Esse caminho é suficiente para visualizar checkout, URL Solana Pay e apresentação do hackathon. A validação real por RPC fica desligada.

### Caminho completo com CLI

No Windows, a forma mais estável é usar WSL/Ubuntu e rodar os comandos Solana dentro do terminal Linux. Depois de instalar o CLI, reabra o terminal e valide:

```bash
solana --version
solana-keygen --version
```

Então rode:

```bash
solana config set --url https://api.devnet.solana.com
solana-keygen new
solana address
solana airdrop 2
solana balance
```

No PowerShell, não cole links em formato Markdown. Use a URL pura:

```powershell
solana config set --url https://api.devnet.solana.com
solana-keygen new
solana address
solana airdrop 2
solana balance
```

Coloque o resultado de `solana address` em `NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS`.

Para o checkout:

- o servidor gera uma public key base58 única para o campo `reference` do Solana Pay;
- a reference interna humana fica em `provider_payload.orderReference`, sem PII;
- o front mostra uma URL Solana Pay com `recipient`, `amount`, `reference`, `label`, `message` e `memo`;
- o backend precisa validar a transação antes de marcar pagamento como confirmado;
- a validação deve conferir cluster, assinatura, recipient, mint, valor, reference e idempotência.

`SOLANA_VALIDATE_TRANSACTIONS=true` ativa uma validação inicial por RPC: existência da transação, ausência de erro, presença da reference e presença da tesouraria destinatária nas account keys. A validação completa de valor/mint deve ser reforçada antes de um piloto com dinheiro real.

Para o relatório:

- o servidor gera o JSON canônico;
- calcula SHA-256;
- ancora o hash em uma transação Devnet, inicialmente via memo;
- grava assinatura em `blockchain_anchors`.

## 5. Pix

No hackathon, use `PIX_PROVIDER=mock`.

O fluxo final deve ter um adapter para PSP real:

- criar payment intent com chave idempotente;
- gerar Pix copia e cola;
- receber webhook assinado;
- validar valor, expiração e pedido;
- registrar `payments`;
- lançar no ledger;
- emitir audit event.

## 6. Checklist para sair do mock

- Supabase URL e publishable key preenchidas.
- Service role configurada só no servidor/deploy.
- `supabase/schema.sql` executado.
- Buckets criados e políticas revisadas.
- Auth redirects configurados.
- Wallet Devnet criada e com SOL.
- Treasury address preenchido.
- RPC configurado.
- `NEXT_PUBLIC_ENABLE_MOCKS=false`.
- Teste manual de upload em `/app/campaigns/:id`.
- Teste manual de Solana Pay em `/c/:campaignSlug`.
- Teste de acesso protegido: abra `/app` ou `/me` sem sessão e confirme o redirecionamento para `/login`.

## 7. Teste de ponta a ponta com Supabase real

1. Abra `/login` e crie uma conta dona.
2. Vá para `/app/users` e crie a organização.
3. Copie o ID retornado pela tela ou use o botão `Usar organização criada` na criação de campanha.
4. Vá para `/app/campaigns/new` e crie campanha/produto.
5. Abra `/login` em outro navegador ou sessão e crie uma conta compradora.
6. Complete o perfil em `/me`.
7. Abra `/c/:campaignSlug` da campanha criada e gere um pedido.
8. Na área do dono, confirme pagamento em `/app/orders` usando a reference.
9. Confirme retirada em `/app/pickup` usando código do pedido e PIN.
10. Gere snapshot em `/app/reports/latest` e abra a URL pública retornada.

Enquanto `NEXT_PUBLIC_ENABLE_MOCKS=true`, esses passos retornam dados simulados. Para persistência real, use `false`.

## Referências oficiais

- [Next.js Installation](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js Environment Variables](https://nextjs.org/docs/app/guides/environment-variables)
- [Supabase com Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Storage Buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Serving assets from Supabase Storage](https://supabase.com/docs/guides/storage/serving/downloads)
- [Solana clusters e Devnet](https://solana.com/docs/references/clusters)
- [Solana Pay specification](https://solana.com/pt/docs/tools/solana-pay/specification/version1)
