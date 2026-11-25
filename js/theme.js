(() => {
  const root = document.documentElement;
  const themeColor = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme, persist) {
    root.dataset.theme = theme;
    if (themeColor) themeColor.content = theme === "dark" ? "#111210" : "#ffffff";

    if (persist) {
      try {
        window.localStorage.setItem("portfolio-theme", theme);
      } catch (error) {
        console.warn("The theme preference could not be saved.", error);
      }
    }
  }

  function syncButton(button) {
    const isDark = root.dataset.theme === "dark";
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  let initialTheme = "light";
  try {
    initialTheme = window.localStorage.getItem("portfolio-theme") === "dark" ? "dark" : "light";
  } catch (error) {
    console.warn("The saved theme preference could not be read.", error);
  }
  applyTheme(initialTheme, false);

  window.PortfolioTheme = {
    attach(button) {
      syncButton(button);
      button.addEventListener("click", () => {
        const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
        button.classList.remove("is-spinning");
        void button.offsetWidth;
        applyTheme(nextTheme, true);
        syncButton(button);
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          button.classList.add("is-spinning");
        }
      });
      button.addEventListener("animationend", (event) => {
        if (event.target === button) button.classList.remove("is-spinning");
      });
    }
  };
})();
