# Visão de negócio

## Produto

A CampusPay é uma infraestrutura de campanhas comerciais para organizações estudantis. Ela conecta aprovação, pré-venda, pagamento, produção, estoque, retirada e prestação de contas em um único histórico verificável.

## Problema

Campanhas de atléticas, centros acadêmicos e diretórios costumam operar com Forms, Pix, planilhas, WhatsApp, contas pessoais e listas de retirada. O fluxo até vende, mas o fechamento financeiro vira uma reconstrução manual.

A dor principal não é criar um checkout. A dor é provar:

- quanto foi vendido;
- quanto foi efetivamente recebido;
- quais despesas foram aprovadas;
- quais pedidos foram produzidos, retirados, cancelados ou reembolsados;
- qual estoque sobrou;
- qual saldo final ficou disponível;
- quem aprovou cada decisão;
- o que a próxima gestão precisa receber.

## Público inicial

O primeiro segmento são atléticas, centros acadêmicos e diretórios que fazem pré-vendas de camisetas, moletons, kits, ingressos ou produtos de eventos.

O piloto ideal tem:

- 50 a 500 compradores potenciais;
- pelo menos duas campanhas por ano;
- uma pessoa responsável por tesouraria;
- produção por lote ou quantidade mínima;
- retirada concentrada no campus;
- dor real com conciliação ou troca de gestão.

## Proposta de valor

Uma organização abre uma campanha, vende, recebe, produz, entrega e fecha suas contas sem reconstruir o histórico em cinco ferramentas diferentes.

Para o comprador, a proposta é saber onde comprar, qual é o status do pedido, quando retirar e como provar que participou da campanha. Para a organização, é operar com menos retrabalho e mais confiança. Para avaliadores, conselhos e próximas gestões, é receber um relatório verificável em vez de uma planilha solta.

## Superfícies do produto

A versão atual em `web/` separa o produto em três experiências:

- **Gestão da organização:** ambiente logado para administradores, tesoureiros, operadores e auditores acompanharem campanhas, pedidos, estoque, financeiro, usuários, logs e fechamento.
- **Marketplace do campus:** vitrine simples para estudantes encontrarem campanhas ativas do próprio campus e entrarem no checkout.
- **Minha conta do comprador:** área para acompanhar pedidos, QR de retirada, dados do campus, métodos de pagamento, preferências, segurança e suporte.

Essa vitrine não muda o posicionamento central: a CampusPay não quer vencer como marketplace genérico. O marketplace local serve como entrada natural para campanhas verificáveis; o diferencial continua sendo o ciclo completo até a prestação de contas.

## Diferencial

A CampusPay não é apenas uma loja online e não é um banco. O diferencial está no ciclo completo:

- autorização antes da venda;
- pagamento reconciliado por pedido;
- ledger de campanha;
- estoque e retirada auditáveis;
- relatório final reproduzível;
- hash ancorado em Solana;
- histórico preservado para conselho, universidade e próxima gestão.

Esse diferencial é intencionalmente pragmático: a blockchain entra para prova e reconciliação, enquanto dados pessoais, documentos privados e decisões operacionais continuam offchain.

## Indicadores de sucesso do MVP

Para o hackathon, o MVP deve provar:

- que o comprador consegue sair do marketplace local e concluir um pedido;
- que o gestor consegue criar campanha, produto e acompanhar pedidos;
- que pagamentos, estoque, retirada e fechamento pertencem ao mesmo histórico;
- que o relatório público não expõe PII;
- que Solana tem papel verificável na solução.

## Modelo comercial futuro

O modelo inicial recomendado é SaaS:

- plano gratuito para uma campanha ativa;
- plano por organização com múltiplas campanhas e gestores;
- licença institucional para universidades;
- taxa de serviço apenas se juridicamente adequada;
- entrega externa como custo separado;
- patrocínio limitado de taxas onchain.

Não basear o negócio em custódia de fundos, spread cambial, rendimento ou token próprio.

