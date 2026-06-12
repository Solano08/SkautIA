"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { Theme } from "@/context/ThemeContext";

const ColombiaMapboxOverlay = dynamic(
  () =>
    import("./ColombiaMapboxOverlay").then((mod) => mod.ColombiaMapboxOverlay),
  { ssr: false, loading: () => null }
);

interface GridPlaneProps {
  theme: Theme;
}

/** Radio del glow que sigue al cursor (px). */
const GLOW_RADIUS = 140;

export function GridPlane({ theme }: GridPlaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId: number | null = null;
    const update = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setSize({ width: el.clientWidth, height: el.clientHeight });
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  const updateGlowPosition = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    const glow = glowRef.current;
    if (!el || !glow) return;

    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left - GLOW_RADIUS;
    const y = clientY - rect.top - GLOW_RADIUS;
    glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
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

  const glowFeather =
    "radial-gradient(circle closest-side, black 30%, transparent 98%)";
  const glowStyle: React.CSSProperties =
    theme === "dark"
      ? {
          backdropFilter: "saturate(1.45) brightness(1.15)",
          WebkitBackdropFilter: "saturate(1.45) brightness(1.15)",
          maskImage: glowFeather,
          WebkitMaskImage: glowFeather,
          background:
            "radial-gradient(circle closest-side, rgba(96,165,250,0.12), transparent 70%)",
        }
      : {
          background:
            "radial-gradient(circle closest-side, rgba(15,23,42,0.09), transparent 72%)",
        };

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden bg-transparent"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {hasSize && (
        <ColombiaMapboxOverlay theme={theme} width={size.width} height={size.height} />
      )}
      <div
        ref={glowRef}
        aria-hidden
        className={clsx(
          "pointer-events-none absolute left-0 top-0 z-10 rounded-full transition-opacity duration-200 will-change-transform",
          isHovering ? "opacity-100" : "opacity-0"
        )}
        style={{
          width: GLOW_RADIUS * 2,
          height: GLOW_RADIUS * 2,
          transform: "translate3d(-9999px, -9999px, 0)",
          ...glowStyle,
        }}
      />
    </div>
  );
}
