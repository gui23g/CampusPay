export const organization = {
  id: "org-atletica-coreia",
  name: "Atlética Engenharia",
  legalName: "Associacao Atletica Academica Engenharia",
  institution: "Inteli",
  campus: "Campus São Paulo",
  campusSlug: "inteli-sp",
  mandate: "Gestão 2026.2",
  treasuryWallet: "11111111111111111111111111111111"
};

export const campaign = {
  id: "camiseta-2026",
  organizationId: organization.id,
  slug: "camisa-atletica-2026",
  publicReportId: "rel-camiseta-2026",
  name: "Camisa Oficial InterCursos 2026",
  status: "Em venda",
  stage: "Pré-venda aprovada",
  purpose: "Financiar inscrição, transporte e materiais do InterCursos.",
  campus: organization.campus,
  campusSlug: organization.campusSlug,
  productImage:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
  startsAt: "2026-09-01",
  endsAt: "2026-09-18",
  estimatedPickup: "2026-10-03",
  minUnits: 80,
  goalUnits: 150,
  soldUnits: 124,
  paidUnits: 118,
  producedUnits: 96,
  pickedUpUnits: 72,
  unitPriceCents: 7900,
  supplierQuoteCents: 4200,
  platformFeeCents: 220,
  version: 3,
  paymentReferencePrefix: "CPAY-CAMISETA-2026",
  approval: {
    status: "Aprovada",
    required: 3,
    completed: 3,
    lastApprovedAt: "2026-09-02T18:40:00Z"
  },
  report: {
    closedAt: "2026-10-10T14:30:00Z",
    solanaSignature: "5DrtX9zQmYcY8h9v7P4xMvpR7s8uF32kJm6uN2nQ4rQqNfA",
    totals: {
      grossRevenueCents: 932200,
      supplierCostCents: 520800,
      feesCents: 25960,
      refundsCents: 15800,
      netResultCents: 369640
    }
  }
};

export const variants = [
  { id: "pp", label: "PP", sku: "CAM-PP", ordered: 8, paid: 8, produced: 8, pickedUp: 5, stock: 3 },
  { id: "p", label: "P", sku: "CAM-P", ordered: 24, paid: 23, produced: 20, pickedUp: 17, stock: 3 },
  { id: "m", label: "M", sku: "CAM-M", ordered: 46, paid: 44, produced: 36, pickedUp: 29, stock: 7 },
  { id: "g", label: "G", sku: "CAM-G", ordered: 34, paid: 31, produced: 24, pickedUp: 18, stock: 6 },
  { id: "gg", label: "GG", sku: "CAM-GG", ordered: 12, paid: 12, produced: 8, pickedUp: 3, stock: 5 }
];

export const orders = [
  {
    code: "CP-2048",
    buyer: "Lia S.",
    buyerEmail: "lia@sou.inteli.edu.br",
    variant: "M",
    quantity: 1,
    amountCents: 7900,
    paymentRail: "pix",
    paymentStatus: "Pago",
    status: "Pronto para retirada",
    reference: "CPAY-CAMISETA-2026-CP2048",
    pickupPin: "417-882"
  },
  {
    code: "CP-2051",
    buyer: "Rafa M.",
    buyerEmail: "rafa@sou.inteli.edu.br",
    variant: "G",
    quantity: 2,
    amountCents: 15800,
    paymentRail: "solana",
    paymentStatus: "Confirmado onchain",
    status: "Em produção",
    reference: "CPAY-CAMISETA-2026-CP2051",
    pickupPin: "623-104"
  },
  {
    code: "CP-2058",
    buyer: "Bia N.",
    buyerEmail: "bia@sou.inteli.edu.br",
    variant: "P",
    quantity: 1,
    amountCents: 7900,
    paymentRail: "pix",
    paymentStatus: "Aguardando conciliação",
    status: "Pagamento pendente",
    reference: "CPAY-CAMISETA-2026-CP2058",
    pickupPin: "000-000"
  },
  {
    code: "CP-2063",
    buyer: "Theo C.",
    buyerEmail: "theo@sou.inteli.edu.br",
    variant: "GG",
    quantity: 1,
    amountCents: 7900,
    paymentRail: "solana",
    paymentStatus: "Confirmado onchain",
    status: "Retirado",
    reference: "CPAY-CAMISETA-2026-CP2063",
    pickupPin: "219-740"
  }
] as const;

export const ledgerEntries = [
  { date: "2026-09-02", account: "Caixa Pix", memo: "Pedidos conciliados", debitCents: 671500, creditCents: 0 },
  { date: "2026-09-02", account: "Caixa Solana", memo: "Stablecoin recebida", debitCents: 260700, creditCents: 0 },
  { date: "2026-09-19", account: "Fornecedor", memo: "Lote 1 camisetas", debitCents: 0, creditCents: 520800 },
  { date: "2026-09-21", account: "Taxas", memo: "PSP + rede", debitCents: 0, creditCents: 25960 },
  { date: "2026-09-24", account: "Reembolsos", memo: "Cancelamentos aprovados", debitCents: 0, creditCents: 15800 }
] as const;

export const productionBatches = [
  { name: "Lote 1", units: 96, status: "Recebido", eta: "2026-09-28" },
  { name: "Lote 2", units: 32, status: "Em fabricação", eta: "2026-10-03" }
];

export const pickupWindows = [
  { date: "03/10", time: "12h-14h", place: "Hall principal", capacity: 70, booked: 58 },
  { date: "04/10", time: "18h-20h", place: "Sala da Atlética", capacity: 70, booked: 41 }
];

export const members = [
  { name: "Marina Alves", role: "Presidência", access: "Aprovadora", status: "Ativa" },
  { name: "João Ferreira", role: "Tesouraria", access: "Financeiro", status: "Ativo" },
  { name: "Clara Nogueira", role: "Operações", access: "Retirada", status: "Ativa" },
  { name: "Prof. Helena", role: "Orientação", access: "Auditoria", status: "Convidada" }
];

export const auditEvents = [
  { at: "02/09 15:41", actor: "Marina", action: "aprovou campanha v3", area: "Campanha" },
  { at: "02/09 18:40", actor: "João", action: "liberou pré-venda", area: "Aprovação" },
  { at: "12/09 09:18", actor: "Sistema", action: "conciliou Pix CP-2048", area: "Pagamento" },
  { at: "13/09 21:04", actor: "Solana watcher", action: "confirmou reference CP-2051", area: "Onchain" },
  { at: "03/10 12:33", actor: "Clara", action: "confirmou retirada CP-2063", area: "Retirada" }
];

export const buyerProfile = {
  name: "Lia Santos",
  email: "lia@sou.inteli.edu.br",
  campus: organization.campus,
  wallet: "9xQeWvG816bUx9EPjHma6zL9W3oY7sZKkq",
  preferredTheme: "system",
  orders: [orders[0], orders[2]]
};
