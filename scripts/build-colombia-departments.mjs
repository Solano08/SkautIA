// Pipeline reproducible de límites departamentales de Colombia.
//
// 1. Descarga los límites ADM1 de alta resolución desde geoBoundaries (gbOpen,
//    fuente OpenStreetMap/Wambacher, licencia ODbL 1.0).
// 2. Los simplifica preservando la topología (fronteras compartidas, sin huecos
//    ni solapes) con mapshaper, reduciendo la precisión a ~11 m.
// 3. Los transforma al esquema que consume la app: FeatureCollection con la
//    propiedad DPTO_CNMBR usando los nombres oficiales DANE.
//
// Uso: node scripts/build-colombia-departments.mjs
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TMP_FULL = join(__dirname, "_co_adm1_full.geojson");
const TMP_SIMPLE = join(__dirname, "_co_adm1_simple.geojson");
const OUTPUT = join(__dirname, "..", "public", "data", "colombia-departments.geojson");

// Release fijado de geoBoundaries para resultados reproducibles.
const SOURCE_URL =
  "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/COL/ADM1/geoBoundaries-COL-ADM1.geojson";

// Retención de vértices: 20% prioriza máxima precisión de costas, islas y fronteras.
const SIMPLIFY_PERCENT = "20%";

// geoBoundaries shapeName -> nombre oficial DANE (DPTO_CNMBR).
const SHAPE_NAME_TO_DPTO = {
  Amazonas: "AMAZONAS",
  Antioquia: "ANTIOQUIA",
  Arauca: "ARAUCA",
  "Archipiélago de San Andrés, Providencia y Santa Catalina":
    "ARCHIPIÉLAGO DE SAN ANDRÉS, PROVIDENCIA Y SANTA CATALINA",
  Atlántico: "ATLÁNTICO",
  "Bogota Capital District": "BOGOTÁ, D.C.",
  Bolívar: "BOLÍVAR",
  Boyacá: "BOYACÁ",
  Caldas: "CALDAS",
  Caquetá: "CAQUETÁ",
  Casanare: "CASANARE",
  Cauca: "CAUCA",
  Cesar: "CESAR",
  Chocó: "CHOCÓ",
  Córdoba: "CÓRDOBA",
  Cundinamarca: "CUNDINAMARCA",
  Guainía: "GUAINÍA",
  Guaviare: "GUAVIARE",
  Huila: "HUILA",
  "La Guajira": "LA GUAJIRA",
  Magdalena: "MAGDALENA",
  Meta: "META",
  Nariño: "NARIÑO",
  "Norte de Santander": "NORTE DE SANTANDER",
  Putumayo: "PUTUMAYO",
  Quindío: "QUINDÍO",
  Risaralda: "RISARALDA",
  Santander: "SANTANDER",
  Sucre: "SUCRE",
  Tolima: "TOLIMA",
  "Valle del Cauca": "VALLE DEL CAUCA",
  Vaupés: "VAUPÉS",
  Vichada: "VICHADA",
};

const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";

async function main() {
  console.log("Descargando límites ADM1 desde geoBoundaries…");
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Descarga falló: HTTP ${res.status}`);
  const full = await res.text();
  writeFileSync(TMP_FULL, full);

  console.log(`Simplificando con mapshaper (visvalingam ${SIMPLIFY_PERCENT})…`);
  const cmd = [
    npxCmd,
    "--yes",
    "mapshaper",
    `"${TMP_FULL}"`,
    "-clean",
    "-simplify",
    "visvalingam",
    `percentage=${SIMPLIFY_PERCENT}`,
    "keep-shapes",
    "-clean",
    "-o",
    `"${TMP_SIMPLE}"`,
    "format=geojson",
    "precision=0.0001",
  ].join(" ");
  execSync(cmd, { stdio: "inherit" });

  const raw = JSON.parse(readFileSync(TMP_SIMPLE, "utf8"));
  const features = raw.features.map((f) => {
    const shapeName = f.properties?.shapeName;
    const dpto = SHAPE_NAME_TO_DPTO[shapeName];
    if (!dpto) throw new Error(`Nombre sin mapear desde geoBoundaries: "${shapeName}"`);
    return { type: "Feature", properties: { DPTO_CNMBR: dpto }, geometry: f.geometry };
  });

  if (features.length !== 33) {
    throw new Error(`Se esperaban 33 departamentos, se obtuvieron ${features.length}`);
  }

  writeFileSync(OUTPUT, JSON.stringify({ type: "FeatureCollection", features }));
  rmSync(TMP_FULL, { force: true });
  rmSync(TMP_SIMPLE, { force: true });
  console.log(`OK -> ${OUTPUT} (${features.length} departamentos)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
