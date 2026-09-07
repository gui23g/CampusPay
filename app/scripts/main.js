const navItems = document.querySelectorAll("[data-view]");
const views = document.querySelectorAll(".view");
const sidebar = document.querySelector(".sidebar");
const jumpButtons = document.querySelectorAll("[data-jump]");
const accessButtons = document.querySelectorAll("[data-access-mode]");
const accessNavGroups = document.querySelectorAll("[data-access-nav]");
const accessContexts = document.querySelectorAll("[data-access-context]");
const paymentTabs = document.querySelectorAll("[data-payment]");
const paymentPanels = document.querySelectorAll("[data-payment-panel]");
const profileControls = document.querySelectorAll("[data-profile-tab]");
const profileTabs = document.querySelectorAll(".account-tab[data-profile-tab]");
const profilePanels = document.querySelectorAll("[data-profile-panel]");
const inviteUserButton = document.querySelector("#inviteUserButton");
const inviteDialog = document.querySelector("#inviteDialog");
const inviteForm = document.querySelector("#inviteForm");
const closeInviteDialog = document.querySelector("#closeInviteDialog");
const cancelInviteDialog = document.querySelector("#cancelInviteDialog");
const toast = document.querySelector("#toast");
const tamperButton = document.querySelector("#tamperButton");
const reportJson = document.querySelector("#reportJson");
const verifyStatus = document.querySelector("#verifyStatus");
const verifiedSymbol = document.querySelector("#verifiedSymbol");
const verifierTitle = document.querySelector("#verifierTitle");
const verifierCopy = document.querySelector("#verifierCopy");
const localHash = document.querySelector("#localHash");

let reportIsTampered = false;

function showProfilePanel(panelId) {
  const targetPanel = document.querySelector(`[data-profile-panel="${panelId}"]`);

  if (!targetPanel) {
    return;
  }

  profilePanels.forEach((panel) => {
    const isActive = panel.dataset.profilePanel === panelId;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });

  profileTabs.forEach((tab) => {
    const isActive = tab.dataset.profileTab === panelId;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
}

function showView(viewId) {
  views.forEach((view) => {
    view.classList.toggle("is-visible", view.id === viewId);
  });

  navItems.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.view === viewId);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setAccess(access, openDefaultView = true) {
  document.body.dataset.access = access;

  accessButtons.forEach((button) => {
    const isActive = button.dataset.accessMode === access;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  accessNavGroups.forEach((group) => {
    group.hidden = group.dataset.accessNav !== access;
  });

  accessContexts.forEach((context) => {
    context.hidden = context.dataset.accessContext !== access;
  });

  if (openDefaultView) {
    showView(access === "management" ? "overview" : "marketplace");
  }
}

navItems.forEach((item) => {
  item.addEventListener("click", () => showView(item.dataset.view));
});

accessButtons.forEach((button) => {
  button.addEventListener("click", () => setAccess(button.dataset.accessMode));
});

profileControls.forEach((button) => {
  button.addEventListener("click", () => showProfilePanel(button.dataset.profileTab));
});

jumpButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.targetAccess) {
      setAccess(button.dataset.targetAccess, false);
    }

    showView(button.dataset.jump);
  });
});

document.querySelectorAll(".option-group, .segmented-control").forEach((control) => {
  control.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      control
        .querySelectorAll("button")
        .forEach((item) => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
    });
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

if (inviteUserButton && inviteDialog) {
  inviteUserButton.addEventListener("click", () => inviteDialog.showModal());
  closeInviteDialog.addEventListener("click", () => inviteDialog.close());
  cancelInviteDialog.addEventListener("click", () => inviteDialog.close());

  inviteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    inviteDialog.close();
    inviteForm.reset();
    toast.hidden = false;
    window.setTimeout(() => {
      toast.hidden = true;
    }, 2600);
  });
}

setAccess("management", false);

sidebar.addEventListener(
  "wheel",
  (event) => {
    if (window.matchMedia("(min-width: 861px)").matches) {
      event.preventDefault();
    }
  },
  { passive: false },
);

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
      verifierTitle.textContent = "Hash divergente";
      verifierCopy.textContent =
        "Um centavo alterado muda o hash. O relatório não corresponde ao fechamento publicado.";
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
    verifierTitle.textContent = "Hash confirmado";
    verifierCopy.textContent =
      "O hash local corresponde à transação publicada, sem expor compradores.";
    localHash.textContent = "8f13...9ac2";
  });
}
