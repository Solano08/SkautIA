"use client";

import type { NavView } from "@/types";
import { MetricsPanel } from "@/components/metrics/MetricsPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";

interface RightPanelProps {
  activeView: NavView;
}

export function RightPanel({ activeView }: RightPanelProps) {
  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col gap-4 border-l border-skaut-border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="shrink-0">
        <MetricsPanel activeView={activeView} />
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-skaut-muted">
          Inteligencia Estratégica
        </p>
        <ChatPanel />
      </div>
    </aside>
  );
}
