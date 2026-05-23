// Local "recently searched" memory. No backend, just localStorage.
// Survives reloads; cleared per device.

const KEY = "tcgo-recent-searches";
const LIMIT = 8;

const history = ref<string[]>([]);
const loaded = ref(false);

const load = () => {
  if (loaded.value || typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    history.value = raw ? (JSON.parse(raw) as string[]).slice(0, LIMIT) : [];
  } catch {
    history.value = [];
  }
  loaded.value = true;
};

const persist = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(history.value));
  } catch {
    // localStorage blocked — drop silently
  }
};

export const useSearchHistory = () => {
  load();

  const remember = (term: string) => {
    const t = term.trim();
    if (!t || t.length < 2) return;
    const lc = t.toLowerCase();
    history.value = [
      t,
      ...history.value.filter((h) => h.toLowerCase() !== lc),
    ].slice(0, LIMIT);
    persist();
  };

  const forget = (term: string) => {
    history.value = history.value.filter((h) => h !== term);
    persist();
  };

  const clear = () => {
    history.value = [];
    persist();
  };

  return { history, remember, forget, clear };
};
