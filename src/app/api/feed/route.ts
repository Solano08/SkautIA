import { NextResponse } from "next/server";
import Parser from "rss-parser";
import type { FeedItem, FeedResponse } from "@/types";
import { LIVE_FEED } from "@/lib/constants";

export const runtime = "nodejs";
// Las noticias se revalidan cada 5 minutos en el servidor; el cliente solo
// consulta este endpoint cacheado (sin exponer fuentes ni chocar con CORS).
export const revalidate = 300;

const RSS_SOURCES: { source: string; url: string }[] = [
  { source: "La República", url: "https://www.larepublica.co/rss/economia" },
  { source: "La República", url: "https://www.larepublica.co/rss/finanzas" },
  { source: "El Tiempo", url: "https://www.eltiempo.com/rss/economia.xml" },
  { source: "Valora Analitik", url: "https://www.valoraanalitik.com/feed/" },
];

const TRM_URL =
  "https://www.datos.gov.co/resource/32sa-8pi3.json?$order=vigenciadesde%20DESC&$limit=4";

const USER_AGENT = "SkautIA/1.0 (+https://skaut.ai)";
const MAX_PER_SOURCE = 4;
const MAX_ITEMS = 9;
const SUMMARY_MAX = 160;

const parser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": USER_AGENT },
});

function cleanText(value: string | undefined): string {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function makeId(prefix: string, seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return `${prefix}-${Math.abs(hash)}`;
}

async function fetchRssSource(source: string, url: string): Promise<FeedItem[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`${source}: HTTP ${res.status}`);

  const xml = await res.text();
  const parsed = await parser.parseString(xml);

  return (parsed.items ?? [])
    .filter((item) => item.title && (item.link || item.guid))
    .slice(0, MAX_PER_SOURCE)
    .map((item) => {
      const link = item.link ?? "";
      const publishedAt = item.isoDate ?? item.pubDate ?? new Date().toISOString();
      const summary = truncate(
        cleanText(item.contentSnippet ?? item.content ?? ""),
        SUMMARY_MAX
      );
      return {
        id: makeId("news", link || String(item.guid)),
        type: "news" as const,
        title: cleanText(item.title),
        summary: summary || undefined,
        source,
        url: link || undefined,
        publishedAt: new Date(publishedAt).toISOString(),
      };
    });
}

async function fetchTrm(): Promise<FeedItem[]> {
  const res = await fetch(TRM_URL, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TRM: HTTP ${res.status}`);

  const rows = (await res.json()) as {
    valor: string;
    vigenciadesde: string;
  }[];
  if (!rows.length) throw new Error("TRM: sin datos");

  const latest = Number(rows[0].valor);
  const previous = rows.length > 1 ? Number(rows[1].valor) : latest;
  const change = latest - previous;
  const pct = previous ? (change / previous) * 100 : 0;

  const formattedValue = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(latest);

  const sign = change > 0 ? "+" : "";
  const changeLabel = `${sign}${change.toFixed(2)} COP (${sign}${pct.toFixed(2)}%)`;

  return [
    {
      id: makeId("trm", rows[0].vigenciadesde),
      type: "market",
      title: `Dólar TRM: ${formattedValue}`,
      summary:
        change === 0
          ? "Tasa Representativa del Mercado, sin cambios frente a la jornada anterior."
          : `Tasa Representativa del Mercado, ${
              change > 0 ? "al alza" : "a la baja"
            } frente a la jornada anterior.`,
      source: "Banco de la República (TRM oficial)",
      url: "https://www.banrep.gov.co/es/estadisticas/trm",
      publishedAt: new Date(rows[0].vigenciadesde).toISOString(),
      change,
      changeLabel,
    },
  ];
}

function fallbackItems(): FeedItem[] {
  return [
    {
      id: "fallback-live",
      type: "macro",
      title: LIVE_FEED.headline,
      summary: LIVE_FEED.description,
      source: "Skaut IA",
      publishedAt: new Date().toISOString(),
    },
  ];
}

export async function GET() {
  const results = await Promise.allSettled([
    fetchTrm(),
    ...RSS_SOURCES.map((s) => fetchRssSource(s.source, s.url)),
  ]);

  const collected: FeedItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") collected.push(...result.value);
  }

  // Dedupe por título (distintas secciones pueden repetir noticias).
  const seen = new Set<string>();
  const deduped = collected.filter((item) => {
    const key = item.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // El mercado (TRM) primero; el resto por fecha descendente.
  const news = deduped
    .filter((i) => i.type !== "market")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  const market = deduped.filter((i) => i.type === "market");

  const items = [...market, ...news].slice(0, MAX_ITEMS);

  const payload: FeedResponse = {
    items: items.length ? items : fallbackItems(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(payload);
}
