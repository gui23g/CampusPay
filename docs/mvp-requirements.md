# Requisitos do MVP

## Objetivo

Entregar um vertical slice demonstrável:

`criar campanha → aprovar → vender → confirmar pagamento → produzir → retirar com QR → fechar → verificar relatório`

## Escopo funcional

### Organização e acesso

- Criar organização estudantil.
- Cadastrar membros com papéis.
- Registrar período de gestão ou mandato.
- Alternar claramente entre experiência de gestão e experiência do comprador.
- Permitir modo claro e modo noturno como preferência de interface.
- Gerenciar usuários, papéis, convites e permissões da organização.
- Exibir logs de atividade da organização para auditoria operacional.
- Aplicar RBAC no backend na implementação real.

### Campanha

- Criar campanha com nome, objetivo, destinação do saldo, período, meta mínima e prazo estimado.
- Cadastrar produto, variantes, preço e quantidade.
- Anexar imagem do produto.
- Submeter campanha para aprovação.
- Aprovar, rejeitar ou solicitar ajuste.
- Congelar versão aprovada antes da primeira venda.

### Checkout

- Marketplace local/campus para descoberta de campanhas ativas.
- Página pública da campanha.
- Seleção de variante.
- Identificação mínima do comprador.
- Escolha de retirada no campus.
- Pedido com código público não sequencial.
- Pix simulado no hackathon.
- Solana Devnet com payment reference por pedido.

### Conta do comprador

- Área "Minha conta" separada da gestão da organização.
- Listagem de pedidos do estudante.
- Acompanhamento de status por etapa: pagamento, produção e retirada.
- QR/PIN de retirada para pedidos liberados.
- Dados pessoais mínimos e campus principal.
- Preferências de pagamento, notificações, segurança e suporte.

### Pagamentos e reconciliação

- Pix e Solana convergem para o mesmo ledger.
- Cada pagamento aponta para um pedido.
- Webhooks e eventos onchain são idempotentes na versão real.
- Valor, moeda/mint, destinatário e referência precisam ser validados.
- Divergências viram estados explícitos.

### Ledger

- Ledger de dupla entrada.
- Receitas, despesas, taxas, reembolsos e ajustes.
- Valores em inteiros.
- Correção por reversão, nunca exclusão de lançamento confirmado.

### Produção e estoque

- Consolidar demanda paga por variante.
- Registrar lote de produção.
- Registrar entrada de estoque.
- Reservar unidade para pedido.
- Registrar movimentações auditáveis.

### Retirada

- Criar ponto e janela de retirada.
- Gerar QR/PIN por pedido.
- Validar QR em tela de scanner.
- Confirmar retirada uma única vez.
- Registrar operador, data e dispositivo.

### Relatório

- Gerar relatório de fechamento com totais reproduzíveis.
- Remover PII do resumo público.
- Criar JSON canônico.
- Calcular SHA-256 server-side.
- Ancorar hash na Solana Devnet.
- Permitir verificação independente.

## Fora de escopo do MVP

- Token próprio.
- NFT decorativo.
- DAO artificial.
- Escrow custodial.
- Conta bancária CampusPay.
- Custódia de reais.
- Pix real obrigatório.
- Marketplace nacional ou multivendedor amplo.
- Entrega residencial como padrão.
- PII onchain.

## Versão atual implementada

A pasta `web/` contém a versão final do MVP em Next.js/TypeScript, com dados mockados por padrão e pontos de integração preparados para Supabase e Solana:

- rotas reais para Gestão, Marketplace, Minha conta e Relatório público;
- login/cadastro via Supabase Auth;
- CRUD de comprador, organização, campanha, produto e pedido via route handlers;
- soft delete/cancelamento para preservar histórico;
- endpoints para confirmação de pagamento, retirada e fechamento;
- modo claro/noturno com persistência local;
- visão geral da campanha;
- campanha versionada e produto com imagem;
- upload de imagem com fallback local e envio para Supabase Storage quando configurado;
- marketplace local por campus;
- checkout público;
- conta do comprador;
- QR de retirada do estudante;
- pedidos e reconciliação;
- produção e estoque;
- retirada;
- financeiro e ledger;
- usuários, convites e papéis;
- logs de atividade;
- relatório/verificador com simulação de adulteração do JSON.

O repositório fica focado na aplicação final em `web/`.
