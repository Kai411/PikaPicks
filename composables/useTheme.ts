import { ref } from "vue";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "tcgo-theme";

const theme = ref<Theme>("system");
const resolved = ref<"light" | "dark">("light");
let initialized = false;

const applyTheme = (t: Theme) => {
  if (typeof window === "undefined") return;
  const next =
    t === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : t;
  resolved.value = next;
  document.documentElement.classList.toggle("dark", next === "dark");
};

export const useTheme = () => {
  if (!initialized && typeof window !== "undefined") {
    initialized = true;
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    theme.value = stored || "system";
    applyTheme(theme.value);

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (theme.value === "system") applyTheme("system");
      });
  }

  const setTheme = (t: Theme) => {
    theme.value = t;
    if (t === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
  };

  const toggle = () => {
    setTheme(resolved.value === "dark" ? "light" : "dark");
  };

  return { theme, resolved, setTheme, toggle };
};
