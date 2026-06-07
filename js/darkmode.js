/* ==========================================================================
   BekkisBags - Dark Mode Toggle
   --------------------------------------------------------------------------
   Speichert die Auswahl in localStorage und hält den Toggle-Button aktuell.
   Light Mode bleibt die Standardansicht, falls noch nichts gespeichert ist.
   ========================================================================== */

(() => {
  const storageKey = "bekkisbags-theme";
  const root = document.documentElement;

  const applyTheme = (theme) => {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  };

  const savedTheme = localStorage.getItem(storageKey);
  applyTheme(savedTheme === "dark" ? "dark" : "light");

  document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector("[data-theme-toggle]");
    const label = button?.querySelector("[data-theme-label]");

    if (!button) {
      return;
    }

    const refreshButton = () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      button.setAttribute("aria-pressed", String(isDark));
      if (label) {
        label.textContent = isDark ? "Light Mode" : "Dark Mode";
      }
    };

    button.addEventListener("click", () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      const nextTheme = isDark ? "light" : "dark";
      applyTheme(nextTheme);
      localStorage.setItem(storageKey, nextTheme);
      refreshButton();
    });

    refreshButton();
  });
})();
