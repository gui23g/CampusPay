# CampusPay

Versao visual de validacao da CampusPay para o Hackathon Universitario da Superteam Brasil.

A aplicacao atual e um front-end estatico de alta fidelidade, sem backend funcionando, criado para validar como o produto deve se comportar na versao final do MVP:

`criar campanha -> aprovar -> vender -> reconciliar pagamento -> produzir -> retirar com QR -> fechar relatorio -> verificar hash`

Abra `app/index.html` no navegador para visualizar.

## Como rodar agora

Esta primeira versao nao precisa instalar dependencias nem iniciar servidor.

1. Abra o arquivo `app/index.html` diretamente no navegador.
2. Navegue pelas areas laterais: Visao geral, Campanha, Checkout, Pedidos, Producao, Retirada, Financeiro e Fechamento.
3. Na tela de Fechamento, use `Alterar JSON` para ver a verificacao do hash falhar.

No Windows, voce tambem pode abrir pelo Explorer:

```text
C:\Users\Inteli\Documents\Hackathon-Coreia\app\index.html
```

Ou, pelo terminal dentro da raiz do repositorio:

```powershell
start .\app\index.html
```

## Estado atual

- Front-end estatico de alta fidelidade.
- Dados mockados.
- Sem backend, Supabase, Pix real ou Solana real ainda.
- Objetivo: validar a experiencia final do MVP e apoiar o pitch do hackathon.

## Estrutura

- `app/`: prototipo front-end estatico.
- `docs/`: documentacao de negocio, produto, arquitetura e roadmap.
- `.context/`: contexto mestre usado por pessoas e agentes de desenvolvimento.
