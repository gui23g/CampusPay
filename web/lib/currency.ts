export function formatCents(valueCents: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency
  }).format(valueCents / 100);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}
