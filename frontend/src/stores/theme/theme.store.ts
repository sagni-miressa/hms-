import { Store } from "@tanstack/store";

export type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  if (localStorage.theme) return localStorage.theme as Theme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const themeStore = new Store<{
  theme: Theme;
}>({
  theme: getInitialTheme(),
});
