"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { FeedItem, FeedResponse, LiveFeedItem } from "@/types";

interface LiveFeedCardProps {
  /** Contenido inicial mientras llega el feed en vivo. */
  fallback?: LiveFeedItem;
}

const POLL_INTERVAL_MS = 120_000;
const ROTATE_INTERVAL_MS = 7_000;

const TYPE_BADGE: Record<FeedItem["type"], { label: string; className: string }> = {
  market: {
    label: "Mercado",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  news: {
    label: "Noticia",
    className: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  macro: {
    label: "Skaut IA",
    className: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return "";
  const rtf = new Intl.RelativeTimeFormat("es-CO", { numeric: "auto" });
  const min = Math.round(ms / 60_000);
  if (Math.abs(min) < 1) return "ahora";
  if (Math.abs(min) < 60) return rtf.format(-min, "minute");
  const hr = Math.round(min / 60);
  if (Math.abs(hr) < 24) return rtf.format(-hr, "hour");
  const day = Math.round(hr / 24);
  return rtf.format(-day, "day");
}

export function LiveFeedCard({ fallback }: LiveFeedCardProps) {
  const [items, setItems] = useState<FeedItem[]>(() =>
    fallback
      ? [
          {
            id: "fallback",
            type: "macro",
            title: fallback.headline,
            summary: fallback.description,
            source: "Skaut IA",
            publishedAt: fallback.timestamp,
          },
        ]
      : []
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const updatedAtRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = () => {
      fetch("/api/feed")
        .then((r) => (r.ok ? r.json() : null))
        .then((data: FeedResponse | null) => {
          if (!active || !data?.items?.length) return;
          updatedAtRef.current = data.updatedAt;
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

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, items.length]);

  if (!items.length) return null;

  const item = items[index % items.length];
  const badge = TYPE_BADGE[item.type];
  const relative = timeAgo(item.publishedAt);

  const TitleTag = item.url ? "a" : "div";
  const titleProps = item.url
    ? { href: item.url, target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <div
      className={clsx(
        "group pointer-events-auto w-36 overflow-hidden rounded-lg border shadow-lg backdrop-blur-md transition-[width,padding,box-shadow,border-radius] duration-300 ease-out",
        "border-white/60 bg-white/90 dark:border-slate-600/60 dark:bg-slate-900/90",
        "px-2.5 py-1.5 group-hover:w-64 group-hover:rounded-xl group-hover:px-3 group-hover:py-2.5 group-hover:shadow-xl"
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
        </span>
        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-red-500">
          Feed en vivo
        </span>
      </div>

      <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-300 ease-out group-hover:mt-2 group-hover:grid-rows-[1fr] group-hover:opacity-100">
        <div className="overflow-hidden">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span
              className={clsx(
                "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                badge.className
              )}
            >
              {badge.label}
            </span>
            {relative && (
              <span className="shrink-0 text-[10px] tabular-nums text-skaut-muted">
                {relative}
              </span>
            )}
          </div>

          <TitleTag
            {...titleProps}
            className={clsx(
              "block text-xs font-bold leading-snug text-skaut-text",
              item.url && "hover:underline"
            )}
            title={item.title}
          >
            {item.title}
          </TitleTag>

          {item.changeLabel && (
            <p
              className={clsx(
                "mt-0.5 text-[11px] font-semibold tabular-nums",
                item.change && item.change > 0
                  ? "text-rose-500"
                  : "text-emerald-500"
              )}
            >
              {item.change && item.change > 0 ? "▲" : "▼"} {item.changeLabel}
            </p>
          )}

          {item.summary && (
            <p className="mt-1 text-[11px] leading-relaxed text-skaut-muted">
              {item.summary}
            </p>
          )}

          <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-skaut-muted">
            <span className="truncate" title={item.source}>
              {item.source}
            </span>
          </div>

          {items.length > 1 && (
            <div className="mt-1.5 flex items-center gap-1">
              {items.slice(0, 9).map((it, i) => (
                <span
                  key={it.id}
                  className={clsx(
                    "h-0.5 flex-1 rounded-full transition-colors",
                    i === index % items.length
                      ? "bg-red-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
