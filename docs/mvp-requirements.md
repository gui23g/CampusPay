# Requisitos do MVP

## Objetivo

Entregar um vertical slice demonstravel:

`criar campanha -> aprovar -> vender -> confirmar pagamento -> produzir -> retirar com QR -> fechar -> verificar relatorio`

## Escopo funcional

### Organizacao e acesso

- Criar organizacao estudantil.
- Cadastrar membros com papeis.
- Registrar periodo de gestao ou mandato.
- Aplicar RBAC no backend na implementacao real.

### Campanha

- Criar campanha com nome, objetivo, destinacao do saldo, periodo, meta minima e prazo estimado.
- Cadastrar produto, variantes, preco e quantidade.
- Anexar imagem do produto.
- Submeter campanha para aprovacao.
- Aprovar, rejeitar ou solicitar ajuste.
- Congelar versao aprovada antes da primeira venda.

### Checkout

- Pagina publica da campanha.
- Selecao de variante.
- Identificacao minima do comprador.
- Escolha de retirada no campus.
- Pedido com codigo publico nao sequencial.
- Pix simulado no hackathon.
- Solana Devnet com payment reference por pedido.

### Pagamentos e reconciliacao

- Pix e Solana convergem para o mesmo ledger.
- Cada pagamento aponta para um pedido.
- Webhooks e eventos onchain sao idempotentes na versao real.
- Valor, moeda/mint, destinatario e referencia precisam ser validados.
- Divergencias viram estados explicitos.

### Ledger

- Ledger de dupla entrada.
- Receitas, despesas, taxas, reembolsos e ajustes.
- Valores em inteiros.
- Correcao por reversao, nunca exclusao de lancamento confirmado.

### Producao e estoque

- Consolidar demanda paga por variante.
- Registrar lote de producao.
- Registrar entrada de estoque.
- Reservar unidade para pedido.
- Registrar movimentacoes auditaveis.

### Retirada

- Criar ponto e janela de retirada.
- Gerar QR/PIN por pedido.
- Validar QR em tela de scanner.
- Confirmar retirada uma unica vez.
- Registrar operador, data e dispositivo.

### Relatorio

- Gerar relatorio de fechamento com totais reproduziveis.
- Remover PII do resumo publico.
- Criar JSON canonico.
- Calcular SHA-256 server-side.
- Ancorar hash na Solana Devnet.
- Permitir verificacao independente.

## Fora de escopo do MVP

- Token proprio.
- NFT decorativo.
- DAO artificial.
- Escrow custodial.
- Conta bancaria CampusPay.
- Custodia de reais.
- Pix real obrigatorio.
- Marketplace nacional.
- Entrega residencial como padrao.
- PII onchain.

## Prototipo atual

A pasta `app/` contem uma versao visual estatica de alta fidelidade, sem backend, cobrindo:

- visao geral da campanha;
- campanha versionada;
- checkout publico;
- pedidos e reconciliacao;
- producao e estoque;
- retirada;
- financeiro e ledger;
- relatorio/verificador com simulacao de adulteracao do JSON.
