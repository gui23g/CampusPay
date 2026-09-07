"use client";

type ThemeMode = "light" | "dark";

export function ThemeToggle() {
  function applyTheme(nextTheme: ThemeMode) {
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("campuspay-theme", nextTheme);
  }

  return (
    <div className="theme-toggle" aria-label="Alternar tema">
      <button data-theme-option="light" type="button" onClick={() => applyTheme("light")}>
        Claro
      </button>
      <button data-theme-option="dark" type="button" onClick={() => applyTheme("dark")}>
        Noturno
      </button>
    </div>
  );
}
