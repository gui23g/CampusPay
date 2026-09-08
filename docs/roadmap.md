# Roadmap

## H0 - Hackathon

- MVP navegável em Next.js com modo mock opcional e fluxo real via Supabase.
- Experiências separadas por rota: Gestão, Marketplace, Minha conta e Relatório público.
- Conta do comprador com pedidos, QR, dados, pagamentos, preferências e segurança.
- Gestão de usuários, convites e logs com fluxo inicial.
- Documentação para avaliadores, roteiro de pitch e guia de demo.
- Descrição de até 300 palavras para submissão.
- Demo de campanha de camisetas.
- Pix simulado.
- Solana Devnet configurável para Solana Pay e âncora de relatório.
- QR de retirada.
- Relatório final com hash.
- Setup documentado para Supabase, Storage, Pix e Solana Devnet.

## H1 - MVP funcional

- Validar Supabase Auth com usuários de papéis diferentes.
- Refinar RLS e policies a partir de testes com dados reais.
- Validar upload de imagens de produto no Storage real.
- Refinar organização, membros e RBAC com dados do piloto.
- Refinar convites, papéis e logs de atividade.
- Refinar campanha versionada.
- Refinar marketplace local por campus.
- Refinar conta do comprador.
- Refinar pedido e checkout.
- Refinar ledger com custos, reembolsos e reversões.
- Refinar estoque e retirada com formulários operacionais completos.
- Refinar report snapshot com assinatura Solana confirmada e verificação externa.
- Automatizar watcher de Solana Devnet para payment reference e anchor.

## H2 - Piloto real

- Integrar PSP Pix.
- Implementar webhooks assinados.
- Implementar jobs de reconciliação.
- Adicionar documentos privados com signed URLs.
- Implementar notificações.
- Testar multi-tenancy e RLS.
- Implementar handover entre gestões.
- Rodar campanha piloto com uma entidade.

## H3 - Produto institucional

- Templates de universidade.
- Dashboard institucional.
- Auditoria permissionada.
- Tesouraria multisig.
- Relatórios comparáveis.
- Portal de fornecedor.
- Mainnet controlada.

