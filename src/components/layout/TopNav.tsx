"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Search, User } from "lucide-react";
import clsx from "clsx";
import type { NavView } from "@/types";
import { NAV_VIEWS } from "@/lib/constants";
import { SettingsMenu } from "@/components/layout/SettingsMenu";

interface TopNavProps {
  activeView: NavView;
  onViewChange: (view: NavView) => void;
}

export function TopNav({ activeView, onViewChange }: TopNavProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) return;

    inputRef.current?.focus();

    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [searchOpen]);

  return (
    <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-skaut-border bg-white px-6 dark:border-slate-700 dark:bg-slate-900">
      <div aria-hidden />

      <nav className="flex items-center justify-center gap-8">
        {NAV_VIEWS.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={clsx(
              "relative pb-1 text-xs font-semibold uppercase tracking-widest transition-colors",
              activeView === view.id
                ? "text-skaut-blue"
                : "text-skaut-muted hover:text-skaut-text dark:hover:text-slate-200"
            )}
          >
            {view.label}
            {activeView === view.id && (
              <span className="absolute -bottom-[17px] left-0 h-0.5 w-full rounded-full bg-skaut-blue" />
            )}
          </button>
        ))}
      </nav>

      <div className="flex items-center justify-end gap-3">
        <div
          ref={searchRef}
          className={clsx(
            "relative overflow-hidden transition-[width] duration-200 ease-out",
            searchOpen ? "w-52" : "w-9"
          )}
        >
          {searchOpen ? (
            <>
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-skaut-muted"
              />
              <input
                ref={inputRef}
                type="search"
                placeholder="Buscar mercado..."
                className="h-9 w-full rounded-full border border-skaut-border bg-slate-50 pl-9 pr-4 text-sm outline-none transition-all placeholder:text-skaut-muted focus:border-skaut-blue focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900"
              />
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar mercado"
              aria-expanded={false}
              className="flex h-9 w-9 items-center justify-center rounded-full text-skaut-muted transition-colors hover:bg-slate-100 hover:text-skaut-text dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Search size={18} />
            </button>
          )}
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-full text-skaut-muted transition-colors hover:bg-slate-100 hover:text-skaut-text dark:hover:bg-slate-800 dark:hover:text-slate-200">
          <Bell size={18} />
        </button>
        <SettingsMenu />
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-skaut-blue text-white shadow-md shadow-blue-200 transition-transform hover:scale-105 dark:shadow-blue-900/40">
          <User size={18} />
        </button>
      </div>
    </header>
  );
}
