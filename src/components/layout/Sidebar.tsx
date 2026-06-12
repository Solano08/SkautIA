"use client";

import {
  ChevronLeft,
  ChevronRight,
  Database,
  FolderKanban,
  HelpCircle,
  Layers,
  Settings,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import type { SidebarSection } from "@/types";
import { SIDEBAR_FOOTER_ITEMS, SIDEBAR_ITEMS } from "@/lib/constants";

const iconMap = {
  Database,
  Layers,
  FolderKanban,
  TrendingUp,
  Wallet,
  Settings,
  HelpCircle,
} satisfies Record<string, LucideIcon>;

interface SidebarProps {
  activeSection: SidebarSection;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onSectionChange: (section: SidebarSection) => void;
}

function SidebarLabel({
  show,
  children,
  className,
}: {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden={!show}
      className={clsx(
        "overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-300 ease-in-out",
        show ? "max-w-[11rem] opacity-100" : "pointer-events-none max-w-0 opacity-0",
        className
      )}
    >
      {children}
    </span>
  );
}

function SidebarNavButton({
  label,
  icon: Icon,
  isActive,
  collapsed,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const showLabels = !collapsed;

  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      className={clsx(
        "relative flex w-full items-center gap-3 py-2.5 text-left text-sm font-medium transition-colors",
        collapsed ? "justify-center px-0" : "px-4",
        isActive
          ? "bg-skaut-blue/[0.08] text-skaut-blue dark:bg-skaut-blue/15 dark:text-skaut-sky"
          : "text-skaut-muted hover:bg-slate-50 hover:text-skaut-text dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
      )}
    >
      <Icon size={18} strokeWidth={isActive ? 2.25 : 2} className="shrink-0" />
      <SidebarLabel show={showLabels} className="leading-tight">
        {label}
      </SidebarLabel>
      {isActive && (
        <span
          aria-hidden
          className="absolute right-0 top-0 h-full w-0.5 bg-skaut-blue dark:bg-skaut-sky"
        />
      )}
    </button>
  );
}

export function Sidebar({
  activeSection,
  collapsed,
  onCollapsedChange,
  onSectionChange,
}: SidebarProps) {
  const showLabels = !collapsed;

  return (
    <aside
      className={clsx(
        "absolute left-0 top-0 z-30 flex h-full flex-col overflow-hidden border-r border-skaut-border bg-white transition-[width] duration-300 ease-in-out [contain:layout_paint] dark:border-slate-700 dark:bg-slate-900",
        collapsed ? "w-[4.5rem]" : "w-[240px] shadow-sm"
      )}
    >
      <div
        className={clsx(
          "shrink-0 border-b border-skaut-border transition-[padding] duration-300 ease-in-out dark:border-slate-700",
          collapsed ? "px-2 py-3" : "px-4 py-4"
        )}
      >
        <div
          className={clsx(
            "flex items-center",
            collapsed ? "flex-col gap-2" : "justify-between gap-2"
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-skaut-blue text-sm font-bold text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/40">
              S
            </div>
            <SidebarLabel show={showLabels}>
              <span className="block truncate text-base font-semibold text-skaut-text dark:text-slate-100">
                Skaut IA
              </span>
            </SidebarLabel>
          </div>
          <button
            type="button"
            onClick={() => onCollapsedChange(!collapsed)}
            title={collapsed ? "Expandir menú" : "Contraer menú"}
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            className="flex h-8 w-8 shrink-0 items-center justify-center text-skaut-muted outline-none ring-0 transition-[color] [-webkit-tap-highlight-color:transparent] hover:text-skaut-text focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none active:ring-0 dark:text-slate-400 dark:hover:text-slate-100"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto py-4 transition-[padding] duration-300 ease-in-out">
        <ul className="space-y-0.5">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];

            return (
              <li key={item.id}>
                <SidebarNavButton
                  label={item.label}
                  icon={Icon}
                  isActive={activeSection === item.id}
                  collapsed={collapsed}
                  onClick={() => onSectionChange(item.id)}
                />
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-skaut-border py-3 transition-[padding] duration-300 ease-in-out dark:border-slate-700">
        <ul className="space-y-0.5">
          {SIDEBAR_FOOTER_ITEMS.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];

            return (
              <li key={item.id}>
                <SidebarNavButton
                  label={item.label}
                  icon={Icon}
                  isActive={activeSection === item.id}
                  collapsed={collapsed}
                  onClick={() => onSectionChange(item.id)}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
