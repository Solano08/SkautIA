import clsx from "clsx";
import type { LiveFeedItem } from "@/types";

interface LiveFeedCardProps {
  feed: LiveFeedItem;
}

export function LiveFeedCard({ feed }: LiveFeedCardProps) {
  return (
    <div
      className={clsx(
        "group pointer-events-auto w-40 overflow-hidden rounded-lg border shadow-lg backdrop-blur-md transition-[padding,box-shadow,border-radius] duration-300 ease-out",
        "border-white/60 bg-white/90 dark:border-slate-600/60 dark:bg-slate-900/90",
        "px-2.5 py-1.5 group-hover:rounded-xl group-hover:px-3 group-hover:py-2.5 group-hover:shadow-xl"
      )}
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
          <h3 className="mb-1 text-xs font-bold leading-snug text-skaut-text">{feed.headline}</h3>
          <p className="text-[11px] leading-relaxed text-skaut-muted">{feed.description}</p>
        </div>
      </div>
    </div>
  );
}
