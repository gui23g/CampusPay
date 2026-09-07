# CampusPay

Versão visual de validação da CampusPay para o Hackathon Universitário da Superteam Brasil.

A aplicação atual é um front-end estático de alta fidelidade, sem backend funcionando, criado para validar como o produto deve se comportar na versão final do MVP:

`criar campanha → aprovar → vender → reconciliar pagamento → produzir → retirar com QR → fechar relatório → verificar hash`

Abra `app/index.html` no navegador para visualizar.

## Como rodar agora

Esta primeira versão não precisa instalar dependências nem iniciar servidor.

1. Abra o arquivo `app/index.html` diretamente no navegador.
2. Navegue pelas áreas laterais: Visão geral, Campanha, Checkout, Pedidos, Produção, Retirada, Financeiro e Fechamento.
3. Na tela de Fechamento, use `Alterar JSON` para ver a verificação do hash falhar.

No Windows, você também pode abrir pelo Explorer:

```text
C:\Users\Inteli\Documents\Hackathon-Coreia\app\index.html
```

Ou, pelo terminal dentro da raiz do repositório:

```powershell
start .\app\index.html
```

## Estado atual

- Front-end estático de alta fidelidade.
- Dados mockados.
- Sem backend, Supabase, Pix real ou Solana real ainda.
- Objetivo: validar a experiência final do MVP e apoiar o pitch do hackathon.

## Estrutura

- `app/`: protótipo front-end estático.
- `docs/`: documentação de negócio, produto, arquitetura e roadmap.
- `.context/`: contexto mestre usado por pessoas e agentes de desenvolvimento.
