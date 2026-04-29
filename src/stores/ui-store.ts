import { create } from "zustand";

export type Theme = "light" | "dark";

interface UIState {
  theme: Theme;
  sidebarCollapsed: boolean;
  searchOpen: boolean;
  commandPaletteOpen: boolean;

  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSearchOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem("fishodo:theme");
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // localStorage unavailable (e.g. SSR / sandbox), fall back to system preference
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("fishodo:theme", theme);
}

export const useUIStore = create<UIState>((set) => {
  const initialTheme = loadTheme();
  applyTheme(initialTheme);

  return {
    theme: initialTheme,
    sidebarCollapsed: false,
    searchOpen: false,
    commandPaletteOpen: false,

    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    setTheme: (theme) => {
      applyTheme(theme);
      set({ theme });
    },
    toggleTheme: () =>
      set((s) => {
        const next = s.theme === "light" ? "dark" : "light";
        applyTheme(next);
        return { theme: next };
      }),
    setSearchOpen: (open) => set({ searchOpen: open }),
    setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  };
});
