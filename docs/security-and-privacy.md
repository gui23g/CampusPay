# Seguranca e privacidade

Este documento resume as decisoes de seguranca do MVP e os cuidados necessarios antes de um piloto real.

## Principios

- Dados pessoais ficam offchain.
- Segredos ficam apenas no servidor ou ambiente de deploy.
- Operacoes sensiveis passam por route handlers.
- IDs publicos nao concedem autorizacao.
- Registros financeiros nao sao apagados fisicamente.
- Correcoes financeiras devem acontecer por reversao/auditoria.

## Autenticacao

Usuarios sao criados via Supabase Auth em `/login`.

Quando `NEXT_PUBLIC_ENABLE_MOCKS=false`, as rotas `/app/*` e `/me/*` exigem sessao no navegador e redirecionam para `/login?next=...`.

A sessao e enviada para APIs internas com:

```text
Authorization: Bearer <access_token>
```

## Autorizacao

A autorizacao de organizacao deve considerar `organization_memberships`.

Papeis previstos:

- `owner`;
- `president`;
- `treasurer`;
- `operator`;
- `auditor`.

Regras gerais:

- comprador acessa apenas seus dados e pedidos;
- membro acessa apenas organizacoes em que possui papel ativo;
- auditor acessa apenas superficies permitidas;
- operacoes financeiras exigem permissao especifica;
- service role nunca e enviada ao cliente.

## Supabase service role

`SUPABASE_SERVICE_ROLE_KEY` e uma chave sensivel. Ela deve ficar somente em:

- `web/.env.local` localmente, sem commit;
- variaveis de ambiente do provedor de deploy;
- processos server-side.

Ela nao pode ser usada em componentes React client-side, arquivos expostos ao browser ou variaveis `NEXT_PUBLIC_*`.

## Row Level Security

O schema inicial em `supabase/schema.sql` inclui base para RLS. Antes de piloto com dados reais, revisar policies tabela por tabela:

- `profiles`;
- `buyer_profiles`;
- `organizations`;
- `organization_memberships`;
- `campaigns`;
- `products`;
- `orders`;
- `payments`;
- `ledger_transactions`;
- `fulfillments`;
- `report_snapshots`;
- `audit_events`.

Mesmo com RLS, operacoes criticas devem passar pelo servidor para centralizar validacao, auditoria e idempotencia.

## Storage

Buckets previstos:

- `product-images`: imagens de produtos, podendo ser publicas quando a campanha esta publicada.
- `documents`: documentos privados, como orcamentos, recibos e comprovantes.

Cuidados:

- limitar tipo e tamanho de upload;
- gerar nomes de arquivo nao previsiveis;
- usar URLs assinadas para documentos privados;
- nao colocar comprovantes sensiveis em bucket publico.

## Pix

No hackathon, `PIX_PROVIDER=mock`.

Para producao, o adapter de PSP deve:

- criar intents idempotentes;
- validar webhook assinado;
- conferir valor, expiracao e pedido;
- impedir processamento duplicado;
- registrar pagamento e ledger no mesmo fluxo transacional quando possivel;
- gerar audit event.

## Solana

Solana deve ser usada em Devnet no hackathon.

O backend deve validar, antes de confirmar pagamento real:

- cluster correto;
- assinatura existente e confirmada;
- transacao sem erro;
- recipient/tesouraria correto;
- mint correto, quando usar SPL token;
- valor correto em base units;
- reference unica vinculada ao pedido;
- ausencia de processamento anterior.

Dados pessoais, itens individuais e informacoes privadas nao devem ir para memo, transacao publica ou relatorio publico.

## Relatorio publico

O relatorio publico deve conter:

- totais agregados;
- contagens;
- status de campanha;
- hash do snapshot;
- assinatura/ancora onchain quando disponivel.

Nao deve conter:

- nome completo de comprador;
- telefone;
- e-mail;
- endereco;
- documentos privados;
- dados bancarios;
- QR/PIN de retirada.

## Riscos conhecidos

- Pix real depende de PSP e revisao juridica.
- Validacao Solana precisa ser endurecida antes de dinheiro real.
- RLS deve ser testado com usuarios de papeis diferentes.
- Relatorios devem ser reproduziveis a partir do ledger.
- Logs nao devem armazenar payloads com PII desnecessaria.

## Checklist antes de piloto

- `NEXT_PUBLIC_ENABLE_MOCKS=false`.
- RLS testado por papel.
- Service role configurada apenas server-side.
- Buckets revisados.
- PSP Pix integrado ou explicitamente simulado.
- Validacao Solana testada em Devnet.
- Politica de retencao de dados definida.
- Termos de uso e consentimento basico preparados.
