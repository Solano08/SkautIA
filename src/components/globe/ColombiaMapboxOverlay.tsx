"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type mapboxgl from "mapbox-gl";
import type { Theme } from "@/context/ThemeContext";
import { formatPopulation } from "@/lib/colombia-departments-population";
import type { DepartmentHoverInfo } from "@/lib/mapbox-departments-interaction";

const REVEAL_TIMEOUT_MS = 12000;

export interface MapViewState {
  zoom: number;
  lng: number;
  lat: number;
}

interface ColombiaMapboxOverlayProps {
  theme: Theme;
  width: number;
  height: number;
  onViewChange?: (view: MapViewState) => void;
  onRegisterReset?: (reset: () => void) => void;
}

function normalizeToken(raw: string | undefined) {
  const token = raw?.trim();
  if (!token) return { token: undefined, valid: false, reason: "missing" as const };
  if (!token.startsWith("pk.")) {
    return { token, valid: false, reason: "invalid_prefix" as const };
  }
  return { token, valid: true, reason: null };
}

function waitForContainerSize(container: HTMLDivElement) {
  return new Promise<void>((resolve) => {
    const check = () => {
      if (container.clientWidth >= 16 && container.clientHeight >= 16) {
        resolve();
        return;
      }
      requestAnimationFrame(check);
    };
    check();
  });
}

export function ColombiaMapboxOverlay({
  theme,
  width,
  height,
  onViewChange,
  onRegisterReset,
}: ColombiaMapboxOverlayProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const colorContainerRef = useRef<HTMLDivElement>(null);
  const mapColorRef = useRef<mapboxgl.Map | null>(null);
  const initGenerationRef = useRef(0);
  const themeRef = useRef(theme);
  const onViewChangeRef = useRef(onViewChange);
  const onRegisterResetRef = useRef(onRegisterReset);
  const introStartedRef = useRef(false);
  const kickoffIntroRef = useRef<(map: mapboxgl.Map) => void>(() => {});

  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [deptTooltip, setDeptTooltip] = useState<DepartmentHoverInfo | null>(null);

  const { token, valid: tokenValid, reason: tokenReason } = normalizeToken(
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  );

  themeRef.current = theme;
  onViewChangeRef.current = onViewChange;
  onRegisterResetRef.current = onRegisterReset;

  useEffect(() => {
    const colorContainer = colorContainerRef.current;
    const host = hostRef.current;
    if (!colorContainer || !host || !token || !tokenValid) return;

    const generation = ++initGenerationRef.current;
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let revealTimeout: ReturnType<typeof setTimeout> | null = null;
    let introKickoffTimeout: ReturnType<typeof setTimeout> | null = null;
    let cancelIntroFly: (() => void) | null = null;
    let layersSetupPromise: Promise<void> | null = null;

    const isStale = () => cancelled || initGenerationRef.current !== generation;

    const emitView = (map: mapboxgl.Map) => {
      const cb = onViewChangeRef.current;
      if (!cb) return;
      const center = map.getCenter();
      cb({ zoom: map.getZoom(), lng: center.lng, lat: center.lat });
    };

    const forceShowMap = () => {
      if (isStale()) return;
      const mapColor = mapColorRef.current;
      if (!mapColor) return;
      if (!introStartedRef.current) {
        kickoffIntroRef.current(mapColor);
        return;
      }
      setMapReady(true);
      emitView(mapColor);
    };

    const init = async () => {
      try {
        await waitForContainerSize(colorContainer);
        if (isStale()) return;

        const [mapboxModule, mapboxLabels] = await Promise.all([
          import("mapbox-gl"),
          import("@/lib/mapbox-colombia-labels"),
        ]);

        if (isStale()) return;

        const mapboxgl = mapboxModule.default;
        const {
          getColombiaTerrainStyle,
          MAP_MAX_ZOOM,
          MAP_MIN_ZOOM,
          MAP_PERFORMANCE_OPTIONS,
          setupColombiaOnlyLabelsWhenReady,
        } = mapboxLabels;

        const {
          applyGlobeAtmosphere,
          flyToColombiaFocus,
          MAP_CAMERA_INTRO_START,
          MAP_INTRO_KICKOFF_MAX_MS,
          runMapIntroFlyTo,
        } = await import("@/lib/mapbox-camera-intro");

        const beginIntroSequence = (mapColor: mapboxgl.Map) => {
          if (isStale() || introStartedRef.current) return;
          introStartedRef.current = true;
          if (introKickoffTimeout) {
            clearTimeout(introKickoffTimeout);
            introKickoffTimeout = null;
          }

          setMapReady(true);
          emitView(mapColor);

          cancelIntroFly = runMapIntroFlyTo(mapColor, {
            onComplete: () => {
              if (isStale()) return;
              const done = () => emitView(mapColor);
              if (layersSetupPromise) {
                void layersSetupPromise.then(done);
              } else {
                done();
              }
            },
          });
        };

        kickoffIntroRef.current = beginIntroSequence;

        const scheduleIntroKickoff = (mapColor: mapboxgl.Map) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (!isStale()) beginIntroSequence(mapColor);
            });
          });

          introKickoffTimeout = setTimeout(() => {
            if (!isStale()) beginIntroSequence(mapColor);
          }, MAP_INTRO_KICKOFF_MAX_MS);
        };

        mapboxgl.workerUrl = "/mapbox-gl-csp-worker.js";
        mapboxgl.accessToken = token;

        setMapError(null);
        setMapReady(false);
        introStartedRef.current = false;

        const mapColor = new mapboxgl.Map({
          style: getColombiaTerrainStyle(),
          container: colorContainer,
          interactive: true,
          attributionControl: true,
          logoPosition: "bottom-right",
          minZoom: MAP_MIN_ZOOM,
          maxZoom: MAP_MAX_ZOOM,
          projection: "globe",
          ...MAP_PERFORMANCE_OPTIONS,
          preserveDrawingBuffer: false,
          center: MAP_CAMERA_INTRO_START.center,
          zoom: MAP_CAMERA_INTRO_START.zoom,
          bearing: MAP_CAMERA_INTRO_START.bearing,
          pitch: MAP_CAMERA_INTRO_START.pitch,
        });

        mapColor.scrollZoom.enable({ around: "center" });
        mapColor.dragPan.enable();
        mapColor.doubleClickZoom.disable();
        mapColor.touchZoomRotate.enable({ around: "center" });
        mapColor.boxZoom.enable();
        mapColor.addControl(
          new mapboxgl.NavigationControl({ showCompass: false }),
          "top-right"
        );

        mapColorRef.current = mapColor;

        const onMapError = (e: mapboxgl.ErrorEvent) => {
          const msg = e.error?.message ?? "";
          if (msg.includes("could not be decoded")) return;
          setMapError(
            msg || "No se pudieron cargar los tiles de Mapbox. Revisa el token."
          );
        };

        mapColor.on("error", onMapError);

        mapColor.on("load", () => {
          if (isStale()) return;

          mapColor.resize();
          applyGlobeAtmosphere(mapColor, themeRef.current);

          layersSetupPromise = setupColombiaOnlyLabelsWhenReady(
            mapColor,
            themeRef.current,
            "colombia-color"
          );

          scheduleIntroKickoff(mapColor);
        });

        mapColor.on("moveend", () => emitView(mapColor));
        mapColor.on("zoomend", () => emitView(mapColor));

        const resetView = () => {
          const mc = mapColorRef.current;
          if (!mc) return;
          flyToColombiaFocus(mc, true);
          mc.once("moveend", () => {
            if (isStale()) return;
            emitView(mc);
          });
        };

        resizeObserver = new ResizeObserver(() => {
          if (isStale()) return;
          mapColor.resize();
        });
        resizeObserver.observe(host);

        revealTimeout = setTimeout(forceShowMap, REVEAL_TIMEOUT_MS);
        onRegisterResetRef.current?.(resetView);
      } catch (err) {
        if (!isStale()) {
          setMapError(
            err instanceof Error ? err.message : "No se pudo inicializar Mapbox GL."
          );
        }
      }
    };

    void init();

    return () => {
      cancelled = true;
      if (revealTimeout) clearTimeout(revealTimeout);
      if (introKickoffTimeout) clearTimeout(introKickoffTimeout);
      cancelIntroFly?.();
      introStartedRef.current = false;
      resizeObserver?.disconnect();
      mapColorRef.current?.remove();
      mapColorRef.current = null;
      setMapReady(false);
    };
  }, [token, tokenValid]);

  useEffect(() => {
    const mapColor = mapColorRef.current;
    if (!mapColor || !mapReady) return;
    themeRef.current = theme;
    void Promise.all([
      import("@/lib/mapbox-colombia-labels"),
      import("@/lib/mapbox-camera-intro"),
    ]).then(([{ updateDepartmentLabelTheme }, { applyGlobeAtmosphere }]) => {
      updateDepartmentLabelTheme(mapColor, theme);
      applyGlobeAtmosphere(mapColor, theme);
    });
  }, [theme, mapReady]);

  useEffect(() => {
    const mapColor = mapColorRef.current;
    if (!mapColor || !mapReady) return;
    mapColor.resize();
  }, [width, height, mapReady]);

  useEffect(() => {
    const mapColor = mapColorRef.current;
    if (!mapColor || !mapReady) return;

    let unbindHover: (() => void) | undefined;

    void import("@/lib/mapbox-departments-interaction").then(({ bindDepartmentHover }) => {
      unbindHover = bindDepartmentHover(mapColor, setDeptTooltip);
    });

    return () => {
      unbindHover?.();
      setDeptTooltip(null);
    };
  }, [mapReady]);

  if (!token || !tokenValid) {
    const hint =
      tokenReason === "invalid_prefix"
        ? "El token debe ser público y empezar por pk. (no uses sk.)."
        : "Copia el token a .env.local y reinicia npm run dev.";

    return (
      <div
        className={clsx(
          "absolute inset-0 z-0 flex items-center justify-center px-6 text-center text-sm",
          theme === "dark" ? "bg-[#0b1120] text-slate-400" : "bg-white text-slate-500"
        )}
        role="status"
      >
        <p>
          Configura{" "}
          <code className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-xs dark:bg-white/10">
            NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
          </code>{" "}
          en <code className="font-mono text-xs">.env.local</code>. {hint}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      className={clsx(
        "pointer-events-auto absolute inset-0 z-0 h-full w-full overflow-hidden",
        theme === "dark" ? "bg-[#0b1120]" : "bg-[#e8eef4]"
      )}
    >
      <div
        ref={colorContainerRef}
        className={clsx(
          "skaut-map-color mapbox-map-host absolute inset-0 z-0 h-full w-full min-h-[120px] min-w-[120px]",
          mapReady ? "opacity-100" : "opacity-0"
        )}
        role="img"
        aria-label="Mapa de Colombia a color"
      />
      {!mapReady && !mapError && (
        <div
          className={clsx(
            "pointer-events-none absolute inset-0 z-[2] flex items-center justify-center text-xs",
            theme === "dark" ? "text-slate-500" : "text-slate-400"
          )}
        >
          Cargando mapa…
        </div>
      )}
      {deptTooltip && (
        <div
          className={clsx(
            "pointer-events-none absolute z-20 max-w-[220px] rounded-lg border px-3 py-2 shadow-lg backdrop-blur-sm",
            theme === "dark"
              ? "border-white/15 bg-slate-900/95 text-slate-100"
              : "border-slate-200 bg-white/95 text-slate-800"
          )}
          style={{
            left: Math.min(deptTooltip.x + 14, Math.max(12, width - 200)),
            top: Math.max(deptTooltip.y - 48, 12),
          }}
          role="tooltip"
        >
          <p className="text-xs font-semibold leading-tight">{deptTooltip.name}</p>
          <p
            className={clsx(
              "mt-0.5 text-[11px] tabular-nums",
              theme === "dark" ? "text-slate-300" : "text-slate-600"
            )}
          >
            {formatPopulation(deptTooltip.population)} habitantes
          </p>
        </div>
      )}
      {mapError && (
        <div
          className={clsx(
            "absolute inset-x-0 top-3 z-[3] mx-auto max-w-md rounded-lg px-4 py-2 text-center text-xs",
            theme === "dark"
              ? "border border-red-500/30 bg-red-950/80 text-red-200"
              : "border border-red-200 bg-red-50 text-red-700"
          )}
          role="alert"
        >
          {mapError}
        </div>
      )}
    </div>
  );
}
