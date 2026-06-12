"use client";

import clsx from "clsx";
import type { NavView } from "@/types";
import { useTheme } from "@/context/ThemeContext";
import { MetricsPanel } from "@/components/metrics/MetricsPanel";

interface RightPanelProps {
  activeView: NavView;
}

const PANEL_INSETS = clsx(
  "top-4 right-4 bottom-[calc(3.0625rem+1rem)]",
  "max-h-[calc(100%-5.0625rem)] w-[min(340px,calc(50%-1.5rem))]"
);

const GLASS_SURFACE = "liquid-glass overflow-hidden rounded-2xl";

export function RightPanel({ activeView }: RightPanelProps) {
  const { theme } = useTheme();
  const surface = theme === "dark" ? "liquid-glass-dark" : "";

  return (
    <>
      <aside
        className={clsx(
          "liquid-glass pointer-events-auto absolute z-20 flex flex-col p-4",
          PANEL_INSETS,
          surface
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <MetricsPanel activeView={activeView} />
        </div>
      </aside>

      <label
        className={clsx(
          GLASS_SURFACE,
          "pointer-events-auto absolute bottom-[calc(3.0625rem+1rem)] left-1/2 z-30 w-[min(340px,calc(100%-2rem))] -translate-x-1/2 p-3",
          surface
        )}
      >
        <span className="sr-only">Consulta sobre el mapa</span>
        <textarea
          rows={3}
          placeholder="Pregunta a la IA sobre un territorio..."
          className="relative z-[1] w-full resize-none bg-transparent text-sm leading-relaxed text-skaut-text outline-none placeholder:text-skaut-muted dark:text-slate-100"
        />
      </label>
    </>
  );
}
