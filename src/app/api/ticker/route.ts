import { NextResponse } from "next/server";
import type { TickerItem, TickerResponse } from "@/types";
import { fetchColombiaIndicators } from "@/lib/data/colombia-metrics";

export const runtime = "nodejs";
// Indicadores de mercado: se revalidan cada 15 minutos en el servidor; el
// cliente solo consulta este endpoint cacheado (sin CORS ni claves expuestas).
export const revalidate = 900;

const USER_AGENT = "SkautIA/1.0 (+https://skaut.ai)";

/** TRM oficial (Superfinanciera vía datos.gov.co, sin clave). */
const TRM_URL =
  "https://www.datos.gov.co/resource/32sa-8pi3.json?$order=vigenciadesde%20DESC&$limit=4";

const PCT_FORMAT = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  signDisplay: "always",
});

const COP_FORMAT = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const DECIMAL_FORMAT = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 1,
});

function pctChange(last: number, prev: number): number {
  return prev ? ((last - prev) / prev) * 100 : 0;
}

async function fetchTrmItem(): Promise<TickerItem> {
  const res = await fetch(TRM_URL, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TRM: HTTP ${res.status}`);

  const rows = (await res.json()) as { valor: string }[];
  if (!rows.length) throw new Error("TRM: sin datos");

  const last = Number(rows[0].valor);
  const prev = rows.length > 1 ? Number(rows[1].valor) : last;
  const change = pctChange(last, prev);

  return {
    code: "TRM",
    value: COP_FORMAT.format(last),
    change,
    changeLabel: `${PCT_FORMAT.format(change)}%`,
  };
}

/**
 * Últimos dos valores de una serie FRED (Reserva Federal de St. Louis).
 * CSV público sin clave; el rango acotado evita descargar todo el histórico.
 */
async function fetchFredSeries(
  seriesId: string,
  lookbackDays: number
): Promise<{ last: number; prev: number }> {
  const start = new Date(Date.now() - lookbackDays * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}&cosd=${start}`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`FRED ${seriesId}: HTTP ${res.status}`);

  // CSV: DATE,VALUE — los días sin dato traen "." y se descartan.
  const values = (await res.text())
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => Number(line.split(",")[1]))
    .filter(Number.isFinite);

  if (values.length < 2) throw new Error(`FRED ${seriesId}: sin histórico`);
  return { last: values[values.length - 1], prev: values[values.length - 2] };
}

/** Petróleo Brent (diario): referencia clave para la economía colombiana. */
async function fetchBrentItem(): Promise<TickerItem> {
  const { last, prev } = await fetchFredSeries("DCOILBRENTEU", 20);
  const change = pctChange(last, prev);
  return {
    code: "BRENT",
    value: `US$${DECIMAL_FORMAT.format(last)}`,
    change,
    changeLabel: `${PCT_FORMAT.format(change)}%`,
  };
}

/** Café suave arábica (mensual, US¢/lb): principal export agrícola del país. */
async function fetchCoffeeItem(): Promise<TickerItem> {
  const { last, prev } = await fetchFredSeries("PCOFFOTMUSDM", 200);
  const change = pctChange(last, prev);
  return {
    code: "CAFÉ",
    value: `US¢${DECIMAL_FORMAT.format(last)}`,
    change,
    changeLabel: `${PCT_FORMAT.format(change)}%`,
  };
}

/** Macro de Colombia (World Bank + BanRep, con fallbacks internos). */
async function fetchMacroItems(): Promise<TickerItem[]> {
  const indicators = await fetchColombiaIndicators();
  return [
    {
      code: "INFLACIÓN",
      value: `${DECIMAL_FORMAT.format(indicators.inflation)}%`,
    },
    {
      code: "PIB",
      change: indicators.gdpGrowth,
      changeLabel: `${PCT_FORMAT.format(indicators.gdpGrowth)}%`,
    },
    {
      code: "DESEMPLEO",
      value: `${DECIMAL_FORMAT.format(indicators.unemployment)}%`,
    },
    {
      code: "TASA BANREP",
      value: `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 }).format(
        indicators.interestRate
      )}%`,
    },
  ];
}

export async function GET() {
  const results = await Promise.allSettled([
    fetchTrmItem(),
    fetchBrentItem(),
    fetchCoffeeItem(),
    fetchMacroItems(),
  ]);

  const items: TickerItem[] = [];
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    if (Array.isArray(result.value)) items.push(...result.value);
    else items.push(result.value);
  }

  const payload: TickerResponse = {
    items,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(payload);
}
