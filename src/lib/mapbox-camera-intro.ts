import type mapboxgl from "mapbox-gl";

/** Cámara 1: vista alejada (referencia: Norteamérica / hemisferio norte). */
export const MAP_CAMERA_INTRO_START = {
  center: [-100, 45] as [number, number],
  zoom: 2.28,
  bearing: 0,
  pitch: 0,
};

/** Cámara 2: Colombia enfocada (referencia HUD del dashboard). */
export const MAP_CAMERA_COLOMBIA = {
  center: [-73.34, 4.22] as [number, number],
  zoom: 5.04,
  bearing: 0,
  pitch: 0,
};

/** Pausa en cámara 1 antes de iniciar el vuelo. */
export const MAP_INTRO_HOLD_DURATION_MS = 1000;

/** Máximo de espera antes de forzar inicio de intro (evita bloqueo en `idle`). */
export const MAP_INTRO_KICKOFF_MAX_MS = 1800;

export const MAP_INTRO_FLY_DURATION_MS = 5000;

export function applyGlobeAtmosphere(map: mapboxgl.Map, theme: "light" | "dark") {
  try {
    if (theme === "dark") {
      map.setFog({
        color: "rgb(186, 210, 235)",
        "high-color": "rgb(36, 92, 223)",
        "horizon-blend": 0.04,
        "space-color": "rgb(11, 17, 32)",
        "star-intensity": 0.45,
      });
    } else {
      map.setFog({
        color: "rgb(220, 230, 245)",
        "high-color": "rgb(140, 180, 230)",
        "horizon-blend": 0.03,
        "space-color": "rgb(240, 245, 255)",
        "star-intensity": 0.15,
      });
    }
  } catch {
    /* estilo sin soporte de niebla */
  }
}

export function jumpToIntroStart(map: mapboxgl.Map) {
  map.jumpTo({ ...MAP_CAMERA_INTRO_START });
}

export function flyToColombiaFocus(map: mapboxgl.Map, animate = false) {
  if (animate) {
    map.flyTo({
      ...MAP_CAMERA_COLOMBIA,
      duration: 900,
      essential: true,
      curve: 1.2,
    });
    return;
  }
  map.jumpTo({ ...MAP_CAMERA_COLOMBIA });
}

function setMapInteractions(map: mapboxgl.Map, enabled: boolean) {
  const method = enabled ? "enable" : "disable";
  map.scrollZoom[method]();
  map.dragPan[method]();
  map.touchZoomRotate[method]();
  map.boxZoom[method]();
  try {
    map.keyboard[method]();
  } catch {
    /* no disponible */
  }
  if (enabled) {
    map.doubleClickZoom.disable();
  }
}

export function runMapIntroFlyTo(
  map: mapboxgl.Map,
  handlers?: { onStart?: () => void; onComplete?: () => void }
): () => void {
  jumpToIntroStart(map);
  setMapInteractions(map, false);

  let holdTimer: ReturnType<typeof setTimeout> | null = null;
  let flyStarted = false;

  const onMoveEnd = () => {
    if (!flyStarted || map.isMoving()) return;
    map.off("moveend", onMoveEnd);
    setMapInteractions(map, true);
    handlers?.onComplete?.();
  };

  const cancel = () => {
    if (holdTimer) clearTimeout(holdTimer);
    map.off("moveend", onMoveEnd);
    if (!flyStarted) setMapInteractions(map, true);
  };

  holdTimer = setTimeout(() => {
    holdTimer = null;

    flyStarted = true;
    handlers?.onStart?.();
    map.on("moveend", onMoveEnd);

    map.flyTo({
      ...MAP_CAMERA_COLOMBIA,
      duration: MAP_INTRO_FLY_DURATION_MS,
      essential: true,
      curve: 1.5,
      speed: 0.55,
      easing: (t) => 1 - Math.pow(1 - t, 2.2),
    });
  }, MAP_INTRO_HOLD_DURATION_MS);

  return cancel;
}
