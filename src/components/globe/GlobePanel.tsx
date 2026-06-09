"use client";

import dynamic from "next/dynamic";
import clsx from "clsx";
import { useTheme } from "@/context/ThemeContext";
import { COLOMBIA_CITIES, LIVE_FEED } from "@/lib/constants";
import { LiveFeedCard } from "./LiveFeedCard";
import { MarketTicker } from "./MarketTicker";

const GridPlane = dynamic(
  () => import("./MapExperience").then((mod) => mod.GridPlane),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-white text-xs text-slate-400 dark:bg-[#0b1120]">
        Cargando mapa…
      </div>
    ),
  }
);

export function GlobePanel() {
  const { theme } = useTheme();

  return (
    <div
      className={clsx(
        "relative flex h-full flex-1 flex-col overflow-hidden",
        theme === "light" ? "bg-white" : "bg-[#0b1120]"
      )}
    >
      <div className="relative min-h-0 flex-1">
        <GridPlane theme={theme} />
        <div className="absolute bottom-10 left-4 z-10">
          <LiveFeedCard feed={LIVE_FEED} />
        </div>
      </div>
      <MarketTicker cities={COLOMBIA_CITIES} />
    </div>
  );
}
