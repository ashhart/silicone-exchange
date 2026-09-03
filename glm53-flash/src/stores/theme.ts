"use client";

import { create } from "zustand";

const STORAGE_KEY = "silicon-exchange.theme.v1";

export type Theme = "dark" | "light";

type ThemeState = {
  theme: Theme;
  hydrated: boolean;
  hydrate: () => void;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
};

function apply(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

function readStoredTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "dark" || raw === "light" ? raw : null;
  } catch {
    return null;
  }
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: "dark",
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    // The inline head script already applied the class before paint; sync
    // the store with what is actually on screen to avoid any flip.
    const fromDom = document.documentElement.classList.contains("dark") ? "dark" : "light";
    const theme = readStoredTheme() ?? fromDom;
    apply(theme);
    set({ theme, hydrated: true });
  },

  setTheme: (theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Persistence unavailable — still apply for the session.
    }
    apply(theme);
    set({ theme });
  },

  toggle: () => {
    get().setTheme(get().theme === "dark" ? "light" : "dark");
  },
}));
