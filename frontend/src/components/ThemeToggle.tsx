import { useStore } from "@tanstack/react-store";
import { themeStore } from "@/stores/theme/theme.store";

export function ThemeToggle() {
  const { theme } = useStore(themeStore);

  const toggleTheme = () => {
    themeStore.setState((prev) => ({
      theme: prev.theme === "dark" ? "light" : "dark",
    }));
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="w-10 h-10 flex items-center justify-center rounded-lg
                 hover:bg-black/5 dark:hover:bg-white/10 transition"
    >
      <span className="material-symbols-outlined text-base">
        {theme === "dark" ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
