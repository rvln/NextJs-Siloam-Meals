"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";


// Tipe untuk konteks tema
type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: "light" | "dark";
  storageKey?: string;
};

type ThemeProviderState = {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
};

// Membuat konteks
const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

/**
 * Provider Tema
 * Komponen ini mengelola state tema (light/dark) di seluruh aplikasi,
 * menyimpannya di localStorage, dan menerapkannya ke elemen root.
 */
export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "siloam-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return defaultTheme;
    }
    return (
      (localStorage.getItem(storageKey) as "light" | "dark") || defaultTheme
    );
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(theme);

    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const value = {
    theme,
    setTheme: (newTheme: "light" | "dark") => {
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Hook untuk menggunakan tema
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
