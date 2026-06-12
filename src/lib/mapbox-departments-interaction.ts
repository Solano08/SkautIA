import type mapboxgl from "mapbox-gl";
import type { Theme } from "@/context/ThemeContext";
import { loadColombiaDepartmentsGeoJSON } from "@/lib/colombia-departments-population";

export const SOURCE_DEPT_POLYGONS = "skaut-co-dept-polygons";
export const LAYER_DEPT_FILL = "skaut-co-dept-fill";
export const LAYER_DEPT_LINES = "skaut-co-dept-lines";

export interface DepartmentHoverInfo {
  name: string;
  population: number;
  x: number;
  y: number;
}

function deptPalette(theme: Theme) {
  return theme === "dark"
    ? {
        fill: "#3b82f6",
        fillOpacity: 0.14,
        fillHover: 0.38,
        line: "#94a3b8",
        lineHover: "#60a5fa",
      }
    : {
        fill: "#2563eb",
        fillOpacity: 0.1,
        fillHover: 0.28,
        line: "#64748b",
        lineHover: "#2563eb",
      };
}

export async function addDepartmentBoundaryLayers(map: mapboxgl.Map, theme: Theme) {
  const geojson = await loadColombiaDepartmentsGeoJSON();
  const palette = deptPalette(theme);

  if (map.getSource(SOURCE_DEPT_POLYGONS)) {
    (map.getSource(SOURCE_DEPT_POLYGONS) as mapboxgl.GeoJSONSource).setData(geojson);
    return;
  }

  map.addSource(SOURCE_DEPT_POLYGONS, {
    type: "geojson",
    data: geojson,
    promoteId: "name_key",
    // El mapa no supera z12 (MAP_MAX_ZOOM): evita teselado innecesario más fino.
    maxzoom: 12,
  });

  map.addLayer({
    id: LAYER_DEPT_FILL,
    type: "fill",
    source: SOURCE_DEPT_POLYGONS,
    minzoom: 3,
    paint: {
      "fill-color": palette.fill,
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        palette.fillHover,
        palette.fillOpacity,
      ],
    },
  });

  map.addLayer({
    id: LAYER_DEPT_LINES,
    type: "line",
    source: SOURCE_DEPT_POLYGONS,
    minzoom: 3,
    paint: {
      "line-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        palette.lineHover,
        palette.line,
      ],
      "line-width": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        2.4,
        1.1,
      ],
      "line-opacity": 0.95,
    },
  });
}

export function updateDepartmentBoundaryTheme(map: mapboxgl.Map, theme: Theme) {
  const palette = deptPalette(theme);
  if (map.getLayer(LAYER_DEPT_FILL)) {
    map.setPaintProperty(LAYER_DEPT_FILL, "fill-color", palette.fill);
  }
  if (map.getLayer(LAYER_DEPT_LINES)) {
    map.setPaintProperty(LAYER_DEPT_LINES, "line-color", [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      palette.lineHover,
      palette.line,
    ]);
  }
}

export function bindDepartmentHover(
  map: mapboxgl.Map,
  onHover: (info: DepartmentHoverInfo | null) => void
): () => void {
  let hoveredKey: string | null = null;
  let rafId: number | null = null;
  let pending: DepartmentHoverInfo & { key: string } | null = null;

  const setHoverState = (key: string, hover: boolean) => {
    map.setFeatureState({ source: SOURCE_DEPT_POLYGONS, id: key }, { hover });
  };

  // Coalesce las actualizaciones de hover/tooltip a un único frame.
  const flush = () => {
    rafId = null;
    if (!pending) return;
    const { key, name, population, x, y } = pending;
    pending = null;

    if (hoveredKey !== key) {
      if (hoveredKey) setHoverState(hoveredKey, false);
      hoveredKey = key;
      setHoverState(key, true);
    }
    onHover({ name, population, x, y });
  };

  const schedule = () => {
    if (rafId == null) rafId = requestAnimationFrame(flush);
  };

  const clearHover = () => {
    pending = null;
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (hoveredKey) {
      setHoverState(hoveredKey, false);
      hoveredKey = null;
    }
    map.getCanvas().style.cursor = "";
    onHover(null);
  };

  const onMouseMove = (event: mapboxgl.MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature) {
      clearHover();
      return;
    }

    const key = String(feature.properties?.name_key ?? feature.id ?? "");
    if (!key) {
      clearHover();
      return;
    }

    map.getCanvas().style.cursor = "pointer";
    pending = {
      key,
      name: String(feature.properties?.name ?? key),
      population: Number(feature.properties?.population ?? 0),
      x: event.point.x,
      y: event.point.y,
    };
    schedule();
  };

  map.on("mousemove", LAYER_DEPT_FILL, onMouseMove);
  map.on("mouseleave", LAYER_DEPT_FILL, clearHover);

  return () => {
    map.off("mousemove", LAYER_DEPT_FILL, onMouseMove);
    map.off("mouseleave", LAYER_DEPT_FILL, clearHover);
    clearHover();
  };
}

export function removeDepartmentBoundaryLayers(map: mapboxgl.Map) {
  if (map.getLayer(LAYER_DEPT_LINES)) map.removeLayer(LAYER_DEPT_LINES);
  if (map.getLayer(LAYER_DEPT_FILL)) map.removeLayer(LAYER_DEPT_FILL);
  if (map.getSource(SOURCE_DEPT_POLYGONS)) map.removeSource(SOURCE_DEPT_POLYGONS);
}
