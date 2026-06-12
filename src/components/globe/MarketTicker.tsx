"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { TickerItem, TickerResponse } from "@/types";

const POLL_INTERVAL_MS = 15 * 60_000;

function TickerEntry({ item }: { item: TickerItem }) {
  return (
    <div className="flex items-center gap-2 px-4">
      <span className="text-xs font-bold text-skaut-text">{item.code}</span>
      {item.value && (
        <span className="text-xs font-semibold tabular-nums text-skaut-text">
          {item.value}
        </span>
      )}
      {item.changeLabel && (
        <span
          className={clsx(
            "text-xs font-semibold tabular-nums",
            (item.change ?? 0) >= 0 ? "text-skaut-success" : "text-skaut-danger"
          )}
        >
          {item.changeLabel}
        </span>
      )}
      <span aria-hidden className="text-skaut-border">
        |
      </span>
    </div>
  );
}

function TickerGroup({ items, hidden }: { items: TickerItem[]; hidden?: boolean }) {
  return (
    <div
      aria-hidden={hidden}
      className="animate-ticker flex min-w-full shrink-0 items-center justify-around whitespace-nowrap group-hover:[animation-play-state:paused]"
    >
      {items.map((item) => (
        <TickerEntry key={item.code} item={item} />
      ))}
    </div>
  );
}

export function MarketTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    let active = true;
    const load = () => {
      fetch("/api/ticker")
        .then((r) => (r.ok ? r.json() : null))
        .then((data: TickerResponse | null) => {
          if (!active || !data?.items?.length) return;
          setItems(data.items);
        })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="market-ticker-bar group relative overflow-hidden border-t border-skaut-border bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
      {items.length ? (
        // Dos copias de ancho >= 100% deslizándose -100%: bucle continuo sin
        // huecos, independientemente del ancho del contenido o del panel.
        <div className="flex w-full">
          <TickerGroup items={items} />
          <TickerGroup items={items} hidden />
        </div>
      ) : (
        <p className="px-4 text-center text-xs text-skaut-muted">
          Cargando indicadores de mercado…
        </p>
      )}
    </div>
  );
}
