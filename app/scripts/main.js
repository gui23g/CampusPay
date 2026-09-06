const navItems = document.querySelectorAll("[data-view]");
const views = document.querySelectorAll(".view");
const jumpButtons = document.querySelectorAll("[data-jump]");
const paymentTabs = document.querySelectorAll("[data-payment]");
const paymentPanels = document.querySelectorAll("[data-payment-panel]");
const tamperButton = document.querySelector("#tamperButton");
const reportJson = document.querySelector("#reportJson");
const verifyStatus = document.querySelector("#verifyStatus");
const verifiedSymbol = document.querySelector("#verifiedSymbol");
const verifierTitle = document.querySelector("#verifierTitle");
const verifierCopy = document.querySelector("#verifierCopy");
const localHash = document.querySelector("#localHash");

let reportIsTampered = false;

function showView(viewId) {
  views.forEach((view) => {
    view.classList.toggle("is-visible", view.id === viewId);
  });

  navItems.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.view === viewId);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

navItems.forEach((item) => {
  item.addEventListener("click", () => showView(item.dataset.view));
});

jumpButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.jump));
});

document.querySelectorAll(".option-group button").forEach((button) => {
  button.addEventListener("click", () => {
    button.parentElement
      .querySelectorAll("button")
      .forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
  });
});

paymentTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const payment = tab.dataset.payment;

    paymentTabs.forEach((item) => {
      item.classList.toggle("is-selected", item.dataset.payment === payment);
    });

    paymentPanels.forEach((panel) => {
      panel.hidden = panel.dataset.paymentPanel !== payment;
    });
  });
});

if (tamperButton && reportJson) {
  tamperButton.addEventListener("click", () => {
    reportIsTampered = !reportIsTampered;

    if (reportIsTampered) {
      reportJson.textContent = `{
  "campaign_id": "cmp_opaque_2026",
  "version": "v1",
  "gross_minor": 834001,
  "production_cost_minor": 490000,
  "refund_minor": 18000,
  "delivered_orders": 136,
  "inventory_remaining": 1,
  "pii": null
}`;
      tamperButton.textContent = "Restaurar JSON";
      verifyStatus.textContent = "falhou";
      verifyStatus.className = "status-pill warning";
      verifiedSymbol.textContent = "!";
      verifiedSymbol.classList.add("is-invalid");
      verifierTitle.textContent = "Hash local nao bate com a ancora";
      verifierCopy.textContent =
        "Um centavo alterado muda o hash. O relatorio nao corresponde ao fechamento publicado.";
      localHash.textContent = "42bc...e118";
      return;
    }

    reportJson.textContent = `{
  "campaign_id": "cmp_opaque_2026",
  "version": "v1",
  "gross_minor": 834000,
  "production_cost_minor": 490000,
  "refund_minor": 18000,
  "delivered_orders": 136,
  "inventory_remaining": 1,
  "pii": null
}`;
    tamperButton.textContent = "Alterar JSON";
    verifyStatus.textContent = "verificado";
    verifyStatus.className = "status-pill success";
    verifiedSymbol.textContent = "OK";
    verifiedSymbol.classList.remove("is-invalid");
    verifierTitle.textContent = "Hash local bate com a ancora";
    verifierCopy.textContent =
      "O relatorio fechado pode ser recalculado e comparado com a transacao publicada, sem revelar compradores.";
    localHash.textContent = "8f13...9ac2";
  });
}
