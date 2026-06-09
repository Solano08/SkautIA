"use client";

import {
  Database,
  FolderKanban,
  HelpCircle,
  Layers,
  TrendingUp,
  Wallet,
} from "lucide-react";
import clsx from "clsx";
import type { SidebarSection } from "@/types";
import { SIDEBAR_ITEMS } from "@/lib/constants";
import { SettingsMenu } from "@/components/layout/SettingsMenu";

const iconMap = {
  Database,
  Layers,
  FolderKanban,
  TrendingUp,
  Wallet,
};

interface SidebarProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-skaut-border bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-skaut-border px-5 py-6 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-skaut-blue text-sm font-bold text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40">
            S
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-skaut-blue">Skaut IA</h1>
            <p className="text-xs text-skaut-muted">Colombia Hub</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-skaut-muted">
          Principal
        </p>
        <ul className="space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive = activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all",
                    isActive
                      ? "bg-skaut-blue text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40"
                      : "text-skaut-muted hover:bg-slate-50 hover:text-skaut-text dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  )}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="leading-tight">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-skaut-border px-3 py-4 dark:border-slate-700">
        <SettingsMenu variant="sidebar" />
        <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-skaut-muted transition-colors hover:bg-slate-50 hover:text-skaut-text dark:hover:bg-slate-800 dark:hover:text-slate-200">
          <HelpCircle size={18} />
          Ayuda
        </button>
      </div>
    </aside>
  );
}
