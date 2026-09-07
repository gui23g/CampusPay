# Requisitos do MVP

## Objetivo

Entregar um vertical slice demonstrável:

`criar campanha → aprovar → vender → confirmar pagamento → produzir → retirar com QR → fechar → verificar relatório`

## Escopo funcional

### Organização e acesso

- Criar organização estudantil.
- Cadastrar membros com papéis.
- Registrar período de gestão ou mandato.
- Aplicar RBAC no backend na implementação real.

### Campanha

- Criar campanha com nome, objetivo, destinação do saldo, período, meta mínima e prazo estimado.
- Cadastrar produto, variantes, preço e quantidade.
- Anexar imagem do produto.
- Submeter campanha para aprovação.
- Aprovar, rejeitar ou solicitar ajuste.
- Congelar versão aprovada antes da primeira venda.

### Checkout

- Página pública da campanha.
- Seleção de variante.
- Identificação mínima do comprador.
- Escolha de retirada no campus.
- Pedido com código público não sequencial.
- Pix simulado no hackathon.
- Solana Devnet com payment reference por pedido.

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
- Marketplace nacional.
- Entrega residencial como padrão.
- PII onchain.

## Protótipo atual

A pasta `app/` contém uma versão visual estática de alta fidelidade, sem backend, cobrindo:

- visão geral da campanha;
- campanha versionada;
- checkout público;
- pedidos e reconciliação;
- produção e estoque;
- retirada;
- financeiro e ledger;
- relatório/verificador com simulação de adulteração do JSON.
