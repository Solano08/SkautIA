import type { FeatureCollection, Point } from "geojson";
import { COLOMBIA_CITIES } from "@/lib/constants";

/** Capitales departamentales (centroide aproximado para etiqueta). */
const COLOMBIA_DEPARTMENTS: { name: string; lng: number; lat: number }[] = [
  { name: "Amazonas", lng: -69.94, lat: -4.22 },
  { name: "Antioquia", lng: -75.57, lat: 6.25 },
  { name: "Arauca", lng: -70.76, lat: 7.09 },
  { name: "Atlántico", lng: -74.78, lat: 10.97 },
  { name: "Bolívar", lng: -75.48, lat: 10.39 },
  { name: "Boyacá", lng: -73.37, lat: 5.54 },
  { name: "Caldas", lng: -75.52, lat: 5.07 },
  { name: "Caquetá", lng: -75.6, lat: 1.61 },
  { name: "Casanare", lng: -72.4, lat: 5.34 },
  { name: "Cauca", lng: -76.61, lat: 2.44 },
  { name: "Cesar", lng: -73.25, lat: 10.48 },
  { name: "Chocó", lng: -76.66, lat: 5.69 },
  { name: "Córdoba", lng: -75.88, lat: 8.75 },
  { name: "Cundinamarca", lng: -74.1, lat: 4.6 },
  { name: "Guainía", lng: -67.92, lat: 3.87 },
  { name: "Guaviare", lng: -72.64, lat: 2.57 },
  { name: "Huila", lng: -75.28, lat: 2.93 },
  { name: "La Guajira", lng: -72.85, lat: 11.54 },
  { name: "Magdalena", lng: -74.2, lat: 11.24 },
  { name: "Meta", lng: -73.63, lat: 4.15 },
  { name: "Nariño", lng: -77.28, lat: 1.21 },
  { name: "Norte de Santander", lng: -72.51, lat: 7.89 },
  { name: "Putumayo", lng: -76.65, lat: 1.15 },
  { name: "Quindío", lng: -75.68, lat: 4.53 },
  { name: "Risaralda", lng: -75.7, lat: 4.81 },
  { name: "San Andrés", lng: -81.7, lat: 12.58 },
  { name: "Santander", lng: -73.12, lat: 7.12 },
  { name: "Sucre", lng: -75.4, lat: 9.3 },
  { name: "Tolima", lng: -75.23, lat: 4.44 },
  { name: "Valle del Cauca", lng: -76.53, lat: 3.45 },
  { name: "Vaupés", lng: -70.17, lat: 1.25 },
  { name: "Vichada", lng: -67.49, lat: 6.19 },
  { name: "Bogotá D.C.", lng: -74.072, lat: 4.711 },
];

const EXTRA_CITIES: { name: string; lng: number; lat: number }[] = [
  { name: "Bucaramanga", lng: -73.1198, lat: 7.1254 },
  { name: "Pereira", lng: -75.6961, lat: 4.8087 },
  { name: "Cúcuta", lng: -72.5078, lat: 7.8939 },
  { name: "Ibagué", lng: -75.2322, lat: 4.4389 },
  { name: "Santa Marta", lng: -74.211, lat: 11.2408 },
  { name: "Villavicencio", lng: -73.627, lat: 4.142 },
  { name: "Pasto", lng: -77.2811, lat: 1.2136 },
  { name: "Montería", lng: -75.8774, lat: 8.7479 },
  { name: "Manizales", lng: -75.517, lat: 5.0703 },
  { name: "Neiva", lng: -75.2819, lat: 2.9273 },
];

function toPointCollection(
  points: { name: string; lng: number; lat: number }[]
): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature",
      properties: { name: p.name },
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
    })),
  };
}

export const colombiaDepartmentsGeoJSON = toPointCollection(COLOMBIA_DEPARTMENTS);

export const colombiaCitiesGeoJSON = toPointCollection([
  ...COLOMBIA_CITIES.map((c) => ({ name: c.name, lng: c.lng, lat: c.lat })),
  ...EXTRA_CITIES.filter(
    (extra) => !COLOMBIA_CITIES.some((c) => c.name === extra.name)
  ),
]);
