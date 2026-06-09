import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Point,
  Polygon,
  Position,
} from "geojson";

/** Población estimada por departamento (proyección DANE, habitantes). */
const POPULATION_BY_KEY: Record<string, number> = {
  AMAZONAS: 78_621,
  ANTIOQUIA: 6_914_256,
  ARAUCA: 313_210,
  ATLANTICO: 2_814_836,
  BOGOTA_DC: 8_138_457,
  BOLIVAR: 2_235_737,
  BOYACA: 1_251_949,
  CALDAS: 1_028_439,
  CAQUETA: 422_075,
  CASANARE: 436_250,
  CAUCA: 1_537_368,
  CESAR: 1_233_518,
  CHOCO: 552_462,
  CORDOBA: 1_114_085,
  CUNDINAMARCA: 2_952_464,
  GUAINIA: 51_209,
  GUAVIARE: 128_729,
  HUILA: 1_222_885,
  LA_GUAJIRA: 963_671,
  MAGDALENA: 1_446_693,
  META: 553_040,
  NARINO: 1_647_740,
  NORTE_DE_SANTANDER: 1_558_510,
  PUTUMAYO: 353_962,
  QUINDIO: 572_242,
  RISARALDA: 978_183,
  SAN_ANDRES: 81_236,
  SANTANDER: 2_210_000,
  SUCRE: 953_782,
  TOLIMA: 1_395_374,
  VALLE_DEL_CAUCA: 4_531_268,
  VAUPES: 47_706,
  VICHADA: 115_157,
};

const GEOJSON_NAME_TO_KEY: Record<string, string> = {
  AMAZONAS: "AMAZONAS",
  ANTIOQUIA: "ANTIOQUIA",
  ARAUCA: "ARAUCA",
  ATLANTICO: "ATLANTICO",
  "BOGOTA, D.C.": "BOGOTA_DC",
  "BOGOTA D.C.": "BOGOTA_DC",
  BOGOTÁ: "BOGOTA_DC",
  BOLIVAR: "BOLIVAR",
  BOYACA: "BOYACA",
  BOYACÁ: "BOYACA",
  CALDAS: "CALDAS",
  CAQUETA: "CAQUETA",
  CAQUETÁ: "CAQUETA",
  CASANARE: "CASANARE",
  CAUCA: "CAUCA",
  CESAR: "CESAR",
  CHOCO: "CHOCO",
  CHOCÓ: "CHOCO",
  CORDOBA: "CORDOBA",
  CÓRDOBA: "CORDOBA",
  CUNDINAMARCA: "CUNDINAMARCA",
  GUAINIA: "GUAINIA",
  GUAINÍA: "GUAINIA",
  GUAVIARE: "GUAVIARE",
  HUILA: "HUILA",
  "LA GUAJIRA": "LA_GUAJIRA",
  MAGDALENA: "MAGDALENA",
  META: "META",
  NARINO: "NARINO",
  NARIÑO: "NARINO",
  "NORTE DE SANTANDER": "NORTE_DE_SANTANDER",
  PUTUMAYO: "PUTUMAYO",
  QUINDIO: "QUINDIO",
  QUINDÍO: "QUINDIO",
  RISARALDA: "RISARALDA",
  "ARCHIPIELAGO DE SAN ANDRES, PROVIDENCIA Y SANTA CATALINA": "SAN_ANDRES",
  "ARCHIPIÉLAGO DE SAN ANDRÉS, PROVIDENCIA Y SANTA CATALINA": "SAN_ANDRES",
  SANTANDER: "SANTANDER",
  SUCRE: "SUCRE",
  TOLIMA: "TOLIMA",
  "VALLE DEL CAUCA": "VALLE_DEL_CAUCA",
  VAUPES: "VAUPES",
  VAUPÉS: "VAUPES",
  VICHADA: "VICHADA",
};

const DISPLAY_NAMES: Record<string, string> = {
  AMAZONAS: "Amazonas",
  ANTIOQUIA: "Antioquia",
  ARAUCA: "Arauca",
  ATLANTICO: "Atlántico",
  BOGOTA_DC: "Bogotá D.C.",
  BOLIVAR: "Bolívar",
  BOYACA: "Boyacá",
  CALDAS: "Caldas",
  CAQUETA: "Caquetá",
  CASANARE: "Casanare",
  CAUCA: "Cauca",
  CESAR: "Cesar",
  CHOCO: "Chocó",
  CORDOBA: "Córdoba",
  CUNDINAMARCA: "Cundinamarca",
  GUAINIA: "Guainía",
  GUAVIARE: "Guaviare",
  HUILA: "Huila",
  LA_GUAJIRA: "La Guajira",
  MAGDALENA: "Magdalena",
  META: "Meta",
  NARINO: "Nariño",
  NORTE_DE_SANTANDER: "Norte de Santander",
  PUTUMAYO: "Putumayo",
  QUINDIO: "Quindío",
  RISARALDA: "Risaralda",
  SAN_ANDRES: "San Andrés",
  SANTANDER: "Santander",
  SUCRE: "Sucre",
  TOLIMA: "Tolima",
  VALLE_DEL_CAUCA: "Valle del Cauca",
  VAUPES: "Vaupés",
  VICHADA: "Vichada",
};

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

export function departmentKeyFromGeoName(raw: string): string | null {
  const normalized = stripAccents(raw).toUpperCase().trim();
  if (GEOJSON_NAME_TO_KEY[normalized]) return GEOJSON_NAME_TO_KEY[normalized];
  const compact = normalized.replace(/\s+/g, " ");
  if (GEOJSON_NAME_TO_KEY[compact]) return GEOJSON_NAME_TO_KEY[compact];
  return null;
}

export function getDepartmentDisplayName(key: string) {
  return DISPLAY_NAMES[key] ?? key.replace(/_/g, " ");
}

export function getDepartmentPopulation(key: string) {
  return POPULATION_BY_KEY[key] ?? 0;
}

export function formatPopulation(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

type DeptGeometry = Polygon | MultiPolygon;

let cachedDepartments: FeatureCollection<DeptGeometry> | null = null;
let cachedDepartmentLabels: FeatureCollection<Point> | null = null;

function ringCentroid(ring: Position[]): [number, number] | null {
  if (ring.length < 3) return null;

  let area2 = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i] as [number, number];
    const [x2, y2] = ring[i + 1] as [number, number];
    const cross = x1 * y2 - x2 * y1;
    area2 += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }

  if (Math.abs(area2) < 1e-12) return null;
  const factor = 1 / (3 * area2);
  return [cx * factor, cy * factor];
}

function polygonCentroid(polygon: Polygon): [number, number] | null {
  const outer = polygon.coordinates[0];
  if (!outer) return null;
  return ringCentroid(outer);
}

function featureCentroid(feature: Feature<DeptGeometry>): [number, number] | null {
  const geometry = feature.geometry;
  if (geometry.type === "Polygon") {
    return polygonCentroid(geometry);
  }

  let best: [number, number] | null = null;
  let bestArea = 0;

  for (const polygonCoords of geometry.coordinates) {
    const polygon: Polygon = { type: "Polygon", coordinates: polygonCoords };
    const outer = polygon.coordinates[0];
    if (!outer || outer.length < 3) continue;

    let area2 = 0;
    for (let i = 0; i < outer.length - 1; i++) {
      const [x1, y1] = outer[i] as [number, number];
      const [x2, y2] = outer[i + 1] as [number, number];
      area2 += x1 * y2 - x2 * y1;
    }
    const area = Math.abs(area2 * 0.5);
    const centroid = ringCentroid(outer);
    if (centroid && area > bestArea) {
      bestArea = area;
      best = centroid;
    }
  }

  return best;
}

function buildDepartmentLabelPoints(
  departments: FeatureCollection<DeptGeometry>
): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: departments.features.map((feature) => {
      const name = String(feature.properties?.name ?? "");
      const nameKey = String(feature.properties?.name_key ?? feature.id ?? "");
      const centroid = featureCentroid(feature) ?? [0, 0];

      return {
        type: "Feature",
        properties: {
          name,
          name_key: nameKey,
          population: Number(feature.properties?.population ?? 0),
        },
        geometry: {
          type: "Point",
          coordinates: centroid,
        },
      };
    }),
  };
}

export async function loadColombiaDepartmentsGeoJSON(): Promise<
  FeatureCollection<DeptGeometry>
> {
  if (cachedDepartments) return cachedDepartments;

  const response = await fetch("/data/colombia-departments.geojson");
  if (!response.ok) {
    throw new Error("No se pudo cargar el mapa departamental de Colombia.");
  }

  const raw = (await response.json()) as FeatureCollection<DeptGeometry>;

  cachedDepartments = {
    type: "FeatureCollection",
    features: raw.features.map((feature, index) => {
      const rawName = String(feature.properties?.DPTO_CNMBR ?? "");
      const key = departmentKeyFromGeoName(rawName) ?? `DEPT_${index}`;
      const name = getDepartmentDisplayName(key);
      const population = getDepartmentPopulation(key);

      return {
        ...feature,
        id: key,
        properties: {
          ...feature.properties,
          name_key: key,
          name,
          population,
        },
      };
    }),
  };

  cachedDepartmentLabels = buildDepartmentLabelPoints(cachedDepartments);

  return cachedDepartments;
}

/** Puntos en el centroide de cada departamento para etiquetas del mapa. */
export async function loadColombiaDepartmentLabelPoints(): Promise<
  FeatureCollection<Point>
> {
  if (cachedDepartmentLabels) return cachedDepartmentLabels;
  await loadColombiaDepartmentsGeoJSON();
  return cachedDepartmentLabels!;
}
