"use client";

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
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-skaut-border bg-white px-6 dark:bg-slate-900 dark:border-slate-700">
      <nav className="flex items-center gap-8">
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

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-skaut-muted"
          />
          <input
            type="search"
            placeholder="Buscar mercado..."
            className="h-9 w-52 rounded-full border border-skaut-border bg-slate-50 pl-9 pr-4 text-sm outline-none transition-all placeholder:text-skaut-muted focus:border-skaut-blue focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900"
          />
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
