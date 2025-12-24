import { themeStore } from "./theme.store";

export function initThemeEffect() {
  const root = document.documentElement;

  const applyTheme = (theme: "light" | "dark") => {
    root.classList.toggle("dark", theme === "dark");
    localStorage.theme = theme;
  };

  // apply on load
  applyTheme(themeStore.state.theme);

  // react to changes
  themeStore.subscribe(() => {
    applyTheme(themeStore.state.theme);
  });
}
