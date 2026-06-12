"use client";

import { useState } from "react";
import type { NavView, SidebarSection } from "@/types";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { GlobePanel } from "@/components/globe/GlobePanel";
import { RightPanel } from "@/components/layout/RightPanel";

export function Dashboard() {
  const [activeView, setActiveView] = useState<NavView>("estrategia");
  const [activeSection, setActiveSection] = useState<SidebarSection>("datos");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        onSectionChange={setActiveSection}
      />

      <div className="flex min-w-0 flex-1 flex-col pl-[4.5rem]">
        <TopNav activeView={activeView} onViewChange={setActiveView} />
        <div className="relative flex min-h-0 flex-1">
          <GlobePanel />
          <RightPanel activeView={activeView} />
        </div>
      </div>
    </div>
  );
}
