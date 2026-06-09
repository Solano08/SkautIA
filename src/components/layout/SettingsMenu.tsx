"use client";

import { useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import clsx from "clsx";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface SettingsMenuProps {
  variant?: "icon" | "sidebar";
}

export function SettingsMenu({ variant = "icon" }: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const isSidebar = variant === "sidebar";

  return (
    <div ref={menuRef} className={clsx("relative", isSidebar && "w-full")}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Ajustes"
        aria-expanded={open}
        className={clsx(
          "transition-colors",
          isSidebar
            ? clsx(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                open
                  ? "bg-skaut-blue text-white"
                  : "text-skaut-muted hover:bg-slate-50 hover:text-skaut-text dark:hover:bg-slate-800 dark:hover:text-slate-200"
              )
            : clsx(
                "flex h-9 w-9 items-center justify-center rounded-full",
                open
                  ? "bg-skaut-blue text-white"
                  : "text-skaut-muted hover:bg-slate-100 hover:text-skaut-text dark:hover:bg-slate-800 dark:hover:text-slate-100"
              )
        )}
      >
        <Settings size={18} />
        {isSidebar && <span>Ajustes</span>}
      </button>

      {open && (
        <div
          className={clsx(
            "z-50 rounded-2xl border border-skaut-border bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900",
            isSidebar
              ? "absolute bottom-full left-0 mb-2 w-full"
              : "absolute right-0 top-11 w-64"
          )}
        >
          <p className="px-3 py-2 text-xs font-bold text-skaut-text dark:text-slate-100">
            Ajustes
          </p>
          <ThemeToggle onSelect={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
