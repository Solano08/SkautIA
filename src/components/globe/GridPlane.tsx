"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { Theme } from "@/context/ThemeContext";
import type { MapViewState } from "./ColombiaMapboxOverlay";

const ColombiaMapboxOverlay = dynamic(
  () =>
    import("./ColombiaMapboxOverlay").then((mod) => mod.ColombiaMapboxOverlay),
  { ssr: false, loading: () => null }
);

interface GridPlaneProps {
  theme: Theme;
}

export function GridPlane({ theme }: GridPlaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [mapView, setMapView] = useState<MapViewState>({
    zoom: 2.28,
    lng: -100,
    lat: 45,
  });

  const resetMapRef = useRef<(() => void) | null>(null);

  const handleMapViewChange = useCallback((view: MapViewState) => {
    setMapView(view);
  }, []);

  const handleRegisterReset = useCallback((reset: () => void) => {
    resetMapRef.current = reset;
  }, []);

  const handleResetView = useCallback(() => {
    resetMapRef.current?.();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setSize({ width: el.clientWidth, height: el.clientHeight });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const updateGlowPosition = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    const glow = glowRef.current;
    if (!el || !glow) return;

    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    glow.style.background = `radial-gradient(circle 140px at ${x}px ${y}px, var(--map-glow-inner), transparent 72%)`;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      updateGlowPosition(e.clientX, e.clientY);
    },
    [updateGlowPosition]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovering(true);
      updateGlowPosition(e.clientX, e.clientY);
    },
    [updateGlowPosition]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const hasSize = size.width > 0 && size.height > 0;

  const hudClass = clsx(
    "pointer-events-none absolute z-20 rounded-lg px-3 py-1.5 text-[10px] font-mono tabular-nums backdrop-blur-sm",
    theme === "dark"
      ? "border border-white/10 bg-black/30 text-white/60"
      : "border border-slate-200 bg-white/80 text-slate-500"
  );

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden bg-transparent"
      style={{
        ["--map-glow-inner" as string]:
          theme === "dark" ? "rgba(0,0,0,0.45)" : "rgba(15,23,42,0.09)",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {hasSize && (
        <ColombiaMapboxOverlay
          theme={theme}
          width={size.width}
          height={size.height}
          onViewChange={handleMapViewChange}
          onRegisterReset={handleRegisterReset}
        />
      )}
      <div
        ref={glowRef}
        aria-hidden
        className={clsx(
          "pointer-events-none absolute inset-0 z-10 transition-opacity duration-200",
          isHovering ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleResetView}
          className={clsx(
            "pointer-events-auto rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
            theme === "dark"
              ? "border border-white/15 bg-black/40 text-white/80 hover:bg-black/55"
              : "border border-slate-200 bg-white/90 text-slate-600 shadow-sm hover:bg-white"
          )}
        >
          Vista inicial
        </button>
        <div
          className={clsx(
            hudClass,
            "flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-3 text-center"
          )}
        >
          <span>
            Zoom: {mapView.zoom.toFixed(2)}× · Lat: {mapView.lat.toFixed(2)} · Lng:{" "}
            {mapView.lng.toFixed(2)}
          </span>
          <span className="hidden opacity-70 sm:inline">·</span>
          <span className="hidden opacity-70 sm:inline">
            Arrastra · Rueda ± · Botones +/−
          </span>
          <span className="opacity-70 sm:hidden">· Arrastra · Zoom</span>
        </div>
      </div>
    </div>
  );
}
