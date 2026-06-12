import type mapboxgl from "mapbox-gl";
import type { Theme } from "@/context/ThemeContext";
import { loadColombiaDepartmentLabelPoints } from "@/lib/colombia-departments-population";
import { flyToColombiaFocus } from "@/lib/mapbox-camera-intro";
import {
  addDepartmentBoundaryLayers,
  LAYER_DEPT_FILL,
  LAYER_DEPT_LINES,
  removeDepartmentBoundaryLayers,
  SOURCE_DEPT_POLYGONS,
  updateDepartmentBoundaryTheme,
} from "@/lib/mapbox-departments-interaction";

const SOURCE_DEPTS = "skaut-co-departments";
const SOURCE_COUNTRIES = "skaut-co-countries";
const LAYER_FOREIGN_FILL = "skaut-co-foreign-fill";
const LAYER_COUNTRY_LINES = "skaut-co-country-lines";
const LAYER_COLOMBIA_BORDER = "skaut-co-colombia-border";
const LAYER_DEPTS = "skaut-co-departments-labels";

const MAPBOX_FONTS = ["DIN Pro Medium", "Arial Unicode MS Regular"];

const LABEL_LAYER_RE =
  /label|place|settlement|state|country|continent|poi|road-number|transit|airport|natural-point/i;

const SKAUT_LAYER_IDS = [
  LAYER_FOREIGN_FILL,
  LAYER_COUNTRY_LINES,
  LAYER_COLOMBIA_BORDER,
  LAYER_DEPT_FILL,
  LAYER_DEPT_LINES,
  LAYER_DEPTS,
] as const;

const SKAUT_SOURCE_IDS = [SOURCE_COUNTRIES, SOURCE_DEPTS, SOURCE_DEPT_POLYGONS] as const;

function mapPalette(theme: Theme) {
  return theme === "dark"
    ? {
        foreignFill: "#1e293b",
        foreignFillOpacity: 0.55,
        countryLine: "#6b7280",
        colombiaLine: "#4b5563",
        labelText: "#e2e8f0",
        labelHalo: "#0f172a",
      }
    : {
        foreignFill: "#f1f5f9",
        foreignFillOpacity: 0.5,
        countryLine: "#94a3b8",
        colombiaLine: "#64748b",
        labelText: "#0f172a",
        labelHalo: "#ffffff",
      };
}

export function getColombiaTerrainStyle() {
  return "mapbox://styles/mapbox/outdoors-v12";
}

const hiddenLabelsFlag = Symbol("skautLabelsHidden");

export function hideDefaultMapLabels(map: mapboxgl.Map) {
  if ((map as mapboxgl.Map & { [hiddenLabelsFlag]?: boolean })[hiddenLabelsFlag]) {
    return;
  }

  const layers = map.getStyle()?.layers ?? [];

  for (const layer of layers) {
    if (layer.id.startsWith("skaut-co")) continue;

    const isSymbolText =
      layer.type === "symbol" &&
      layer.layout &&
      "text-field" in layer.layout &&
      layer.layout["text-field"];

    const isLabelId = LABEL_LAYER_RE.test(layer.id);

    if (isSymbolText || isLabelId) {
      try {
        map.setLayoutProperty(layer.id, "visibility", "none");
      } catch {
        /* capa no disponible */
      }
    }
  }

  (map as mapboxgl.Map & { [hiddenLabelsFlag]?: boolean })[hiddenLabelsFlag] = true;
}

function removeSkautLayers(map: mapboxgl.Map) {
  for (const layerId of SKAUT_LAYER_IDS) {
    if (map.getLayer(layerId)) map.removeLayer(layerId);
  }
  removeDepartmentBoundaryLayers(map);
  for (const sourceId of SKAUT_SOURCE_IDS) {
    if (map.getSource(sourceId)) map.removeSource(sourceId);
  }
}

function addInternationalCountryLayers(map: mapboxgl.Map, theme: Theme) {
  const palette = mapPalette(theme);

  if (!map.getSource(SOURCE_COUNTRIES)) {
    map.addSource(SOURCE_COUNTRIES, {
      type: "vector",
      url: "mapbox://mapbox.country-boundaries-v1",
    });
  }

  map.addLayer({
    id: LAYER_FOREIGN_FILL,
    type: "fill",
    source: SOURCE_COUNTRIES,
    "source-layer": "country_boundaries",
    filter: [
      "all",
      ["==", ["get", "disputed"], "false"],
      ["!=", ["get", "iso_3166_1_alpha_3"], "COL"],
    ],
    paint: {
      "fill-color": palette.foreignFill,
      "fill-opacity": palette.foreignFillOpacity,
    },
  });

  map.addLayer({
    id: LAYER_COUNTRY_LINES,
    type: "line",
    source: SOURCE_COUNTRIES,
    "source-layer": "country_boundaries",
    filter: ["==", ["get", "disputed"], "false"],
    paint: {
      "line-color": palette.countryLine,
      "line-width": ["interpolate", ["linear"], ["zoom"], 2, 0.5, 5, 1, 9, 1.6],
      "line-opacity": 0.95,
    },
  });

  map.addLayer({
    id: LAYER_COLOMBIA_BORDER,
    type: "line",
    source: SOURCE_COUNTRIES,
    "source-layer": "country_boundaries",
    filter: [
      "all",
      ["==", ["get", "disputed"], "false"],
      ["==", ["get", "iso_3166_1_alpha_3"], "COL"],
    ],
    paint: {
      "line-color": palette.colombiaLine,
      "line-width": ["interpolate", ["linear"], ["zoom"], 2, 1.2, 6, 2, 10, 2.5],
    },
  });
}

async function addDepartmentLabelLayer(map: mapboxgl.Map, theme: Theme) {
  const palette = mapPalette(theme);
  const labelPoints = await loadColombiaDepartmentLabelPoints();

  if (map.getSource(SOURCE_DEPTS)) {
    (map.getSource(SOURCE_DEPTS) as mapboxgl.GeoJSONSource).setData(labelPoints);
  } else {
    map.addSource(SOURCE_DEPTS, {
      type: "geojson",
      data: labelPoints,
      maxzoom: MAP_MAX_ZOOM,
      buffer: 32,
    });
  }

  if (map.getLayer(LAYER_DEPTS)) return;

  map.addLayer({
    id: LAYER_DEPTS,
    type: "symbol",
    source: SOURCE_DEPTS,
    minzoom: 3,
    layout: {
      "text-field": ["get", "name"],
      "text-font": MAPBOX_FONTS,
      "text-size": ["interpolate", ["linear"], ["zoom"], 3, 9, 6, 11, 9, 13],
      "text-transform": "uppercase",
      "text-letter-spacing": 0.05,
      "text-anchor": "center",
      "text-justify": "center",
      "text-max-width": 12,
    },
    paint: {
      "text-color": palette.labelText,
      "text-halo-color": palette.labelHalo,
      "text-halo-width": 1.5,
      "text-opacity": 0.95,
    },
  });
}

export function updateDepartmentLabelTheme(map: mapboxgl.Map, theme: Theme) {
  const palette = mapPalette(theme);
  updateDepartmentBoundaryTheme(map, theme);
  if (map.getLayer(LAYER_DEPTS)) {
    map.setPaintProperty(LAYER_DEPTS, "text-color", palette.labelText);
    map.setPaintProperty(LAYER_DEPTS, "text-halo-color", palette.labelHalo);
  }
  if (map.getLayer(LAYER_FOREIGN_FILL)) {
    map.setPaintProperty(LAYER_FOREIGN_FILL, "fill-color", palette.foreignFill);
    map.setPaintProperty(LAYER_FOREIGN_FILL, "fill-opacity", palette.foreignFillOpacity);
  }
  if (map.getLayer(LAYER_COUNTRY_LINES)) {
    map.setPaintProperty(LAYER_COUNTRY_LINES, "line-color", palette.countryLine);
  }
  if (map.getLayer(LAYER_COLOMBIA_BORDER)) {
    map.setPaintProperty(LAYER_COLOMBIA_BORDER, "line-color", palette.colombiaLine);
  }
}

/**
 * Resuelve cuando el relleno gris de países extranjeros ya está cargado y
 * pintado, para revelar el mapa sin el parpadeo a color (p. ej. EE. UU.).
 */
export function whenForeignCountriesReady(map: mapboxgl.Map): Promise<void> {
  return new Promise((resolve) => {
    const isReady = () =>
      map.getLayer(LAYER_FOREIGN_FILL) != null &&
      map.getSource(SOURCE_COUNTRIES) != null &&
      map.isSourceLoaded(SOURCE_COUNTRIES);

    if (isReady()) {
      resolve();
      return;
    }

    const onData = () => {
      if (!isReady()) return;
      map.off("sourcedata", onData);
      resolve();
    };

    map.on("sourcedata", onData);
  });
}

export type MapLayerMode = "world-gray" | "colombia-color";

async function runSetup(map: mapboxgl.Map, theme: Theme, mode: MapLayerMode) {
  hideDefaultMapLabels(map);
  removeSkautLayers(map);

  if (mode === "world-gray") {
    try {
      addInternationalCountryLayers(map, theme);
    } catch (error) {
      console.warn("[Skaut IA] Capas de países no disponibles:", error);
    }
    return;
  }

  try {
    addInternationalCountryLayers(map, theme);
  } catch (error) {
    console.warn("[Skaut IA] Borde de Colombia no disponible:", error);
  }

  try {
    await addDepartmentBoundaryLayers(map, theme);
  } catch (error) {
    console.warn("[Skaut IA] Límites departamentales no disponibles:", error);
  }

  try {
    await addDepartmentLabelLayer(map, theme);
  } catch (error) {
    console.warn("[Skaut IA] Etiquetas de departamentos no disponibles:", error);
  }
}

export function setupColombiaOnlyLabels(
  map: mapboxgl.Map,
  theme: Theme,
  mode: MapLayerMode = "colombia-color"
) {
  if (!map.isStyleLoaded()) return;
  void runSetup(map, theme, mode);
}

/** Aplica capas en cuanto el estilo está listo (sin esperar `idle`, que puede no dispararse). */
export function setupColombiaOnlyLabelsWhenReady(
  map: mapboxgl.Map,
  theme: Theme,
  mode: MapLayerMode = "colombia-color"
): Promise<void> {
  return new Promise((resolve) => {
    const apply = () => {
      void runSetup(map, theme, mode)
        .catch((error) => {
          console.warn("[Skaut IA] Configuración parcial de capas:", error);
        })
        .finally(resolve);
    };

    if (map.isStyleLoaded()) {
      queueMicrotask(apply);
      return;
    }

    map.once("load", apply);
  });
}

/** Opciones compartidas para mapas más fluidos (menos trabajo por frame). */
export const MAP_PERFORMANCE_OPTIONS = {
  // Fundido cruzado entre teselas: mantiene la textura anterior (con color)
  // visible hasta que la nueva carga del todo. Evita el parpadeo a "blanco y
  // negro" (relieve sin color) al hacer zoom rápido.
  fadeDuration: 300,
  renderWorldCopies: false,
  antialias: false,
  maxPitch: 0,
  pitch: 0,
  bearing: 0,
  // Prefetch agresivo de teselas padre: al alejarse aparecen al instante.
  prefetchZoomDelta: 5,
  refreshExpiredTiles: false,
  // Solo usamos una fuente de etiquetas; evita el cálculo de colisiones cruzadas.
  crossSourceCollisions: false,
  // Caché de teselas grande y persistente: como la navegación está acotada a
  // Colombia, al volver a un nivel de zoom las texturas ya están cargadas en
  // memoria y no se vuelven a descargar ni a procesar.
  minTileCacheSize: 256,
  maxTileCacheSize: 1024,
} as const;

// Incluye el territorio insular del Pacífico y Caribe (Malpelo, San Andrés y
// Providencia) con un pequeño margen, para no recortar lo que el usuario puede ver.
export const COLOMBIA_MAX_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-82.2, -4.6],
  [-66.5, 13.7],
];

export const MAP_MIN_ZOOM = 2.2;
export const MAP_MAX_ZOOM = 12;

export function fitColombiaDefaultView(map: mapboxgl.Map, animate = false) {
  flyToColombiaFocus(map, animate);
}
