# Roteiro do pitch

O video deve ter ate 5 minutos.

## Estrutura sugerida

### 1. O problema

Campanhas estudantis vendem camisetas, kits e ingressos com Forms, Pix, planilhas e WhatsApp. A venda acontece, mas o fechamento vira um trabalho manual: conciliar pagamentos, estoque, despesas, reembolsos, retiradas e prestacao para conselho ou universidade.

Mensagem central:

> Vender uma camiseta e simples. Provar quanto entrou, quanto saiu, quem recebeu e para onde foi o saldo e o trabalho que quebra a operacao.

### 2. A solucao

A CampusPay conecta toda a campanha:

`aprovar -> vender -> pagar -> produzir -> retirar -> fechar`

Cada evento operacional alimenta o ledger e o relatorio final.

### 3. Por que Solana

Solana e usada onde existe necessidade de verificacao:

- pagamento em stablecoin com reference por pedido;
- tesouraria compartilhada;
- hash do relatorio final;
- verificacao publica sem expor dados pessoais.

### 4. MVP na pratica

A demo acompanha uma atletica vendendo camisetas:

- campanha aprovada;
- checkout com Pix simulado e Solana;
- dashboard de conciliacao;
- estoque e retirada com QR;
- relatorio final;
- verificacao do hash na Devnet.

### 5. Proximos passos

- Integrar Supabase.
- Implementar schema e RLS.
- Adicionar Solana Devnet real.
- Validar com uma atletica ou CA.
- Preparar piloto com Pix PSP.

## Criterios do hackathon

- Problema: 30%.
- Solucao: 25%.
- Fit cultural brasileiro: 20%.
- Uso da Solana: 15%.
- Clareza: 10%.

