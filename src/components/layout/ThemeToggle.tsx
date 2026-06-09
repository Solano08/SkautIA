"use client";

import { Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  onSelect?: () => void;
}

export function ThemeToggle({ onSelect }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const handleSelect = (mode: "light" | "dark") => {
    setTheme(mode);
    onSelect?.();
  };

  return (
    <div className="space-y-1">
      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-skaut-muted">
        Tema
      </p>

      <button
        onClick={() => handleSelect("light")}
        className={clsx(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
          theme === "light"
            ? "bg-skaut-blue text-white"
            : "text-skaut-text hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
        )}
      >
        <Sun size={16} />
        <div className="text-left">
          <span className="block font-medium">Modo claro</span>
          <span className={clsx("text-[10px]", theme === "light" ? "text-blue-100" : "text-skaut-muted")}>
            Globo con fondo blanco
          </span>
        </div>
      </button>

      <button
        onClick={() => handleSelect("dark")}
        className={clsx(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
          theme === "dark"
            ? "bg-skaut-blue text-white"
            : "text-skaut-text hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
        )}
      >
        <Moon size={16} />
        <div className="text-left">
          <span className="block font-medium">Modo oscuro</span>
          <span className={clsx("text-[10px]", theme === "dark" ? "text-blue-100" : "text-skaut-muted")}>
            Globo con espacio exterior
          </span>
        </div>
      </button>
    </div>
  );
}
