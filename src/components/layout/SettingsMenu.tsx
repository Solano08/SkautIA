"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function SettingsMenu() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="flex h-9 w-9 items-center justify-center rounded-full text-skaut-muted outline-none ring-0 transition-[color] [-webkit-tap-highlight-color:transparent] hover:text-skaut-text focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none active:ring-0 dark:text-slate-400 dark:hover:text-slate-100"
    >
      {isDark ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
