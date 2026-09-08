# Roteiro do pitch

O vídeo deve ter até 5 minutos.

## Estrutura sugerida

### 1. O problema

Campanhas estudantis vendem camisetas, kits e ingressos com Forms, Pix, planilhas e WhatsApp. A venda acontece, mas o fechamento vira um trabalho manual: conciliar pagamentos, estoque, despesas, reembolsos, retiradas e prestação para conselho ou universidade.

Mensagem central:

> Vender uma camiseta é simples. Provar quanto entrou, quanto saiu, quem recebeu e para onde foi o saldo é o trabalho que quebra a operação.

### 2. A solução

A CampusPay conecta toda a campanha:

`aprovar → vender → pagar → produzir → retirar → fechar`

Cada evento operacional alimenta o ledger e o relatório final.

### 3. Por que Solana

Solana é usada onde existe necessidade de verificação:

- pagamento em stablecoin com reference por pedido;
- tesouraria compartilhada;
- hash do relatório final;
- verificação pública sem expor dados pessoais.

### 4. MVP na prática

A demo acompanha uma atlética vendendo camisetas:

- campanha aprovada;
- alternância entre visão da organização e visão do comprador;
- marketplace local do campus como entrada da compra;
- checkout com Pix simulado e Solana;
- dashboard de conciliação;
- estoque e retirada com QR;
- conta do estudante com pedidos, pagamento, QR e preferências;
- relatório final;
- verificação do hash na Devnet.

### 5. Próximos passos

- Validar o fluxo com uma atlética, CA ou DCE real.
- Refinar policies de RLS e papéis a partir do piloto.
- Trocar o Pix mock por um PSP real com webhooks assinados.
- Endurecer validação Solana por valor, mint, destinatário, assinatura e idempotência.
- Preparar operação assistida para a primeira campanha de verdade.

## Critérios do hackathon

- Problema: 30%.
- Solução: 25%.
- Fit cultural brasileiro: 20%.
- Uso da Solana: 15%.
- Clareza: 10%.

O mapeamento detalhado desses critérios está em [Mapa dos criterios do hackathon](./evaluation-map.md).

