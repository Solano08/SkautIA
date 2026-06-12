export type NavView = "estrategia" | "seguridad" | "inteligencia" | "predicciones";

export type SidebarSection =
  | "datos"
  | "capas"
  | "proyectos"
  | "historial"
  | "carteras"
  | "ajustes"
  | "ayuda";

export interface CityMetric {
  code: string;
  name: string;
  change: number;
  lat: number;
  lng: number;
}

export interface SectorMetric {
  id: string;
  label: string;
  value: string;
  unit: string;
  change: number;
  changeLabel: string;
  progress?: number;
  riskLevel?: "BAJO" | "MEDIO" | "ALTO";
  chartData?: number[];
  source: string;
}

export interface LiveFeedItem {
  title: string;
  headline: string;
  description: string;
  timestamp: string;
}

export type FeedItemType = "news" | "market" | "macro";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  summary?: string;
  source: string;
  url?: string;
  publishedAt: string;
  /** Variación numérica asociada (p. ej. cambio de la TRM). */
  change?: number;
  /** Texto corto de la variación (p. ej. "+0,4%" o "BAJO"). */
  changeLabel?: string;
}

export interface FeedResponse {
  items: FeedItem[];
  updatedAt: string;
}

/** Entrada de la cinta de indicadores de mercado (MarketTicker). */
export interface TickerItem {
  /** Etiqueta corta, p. ej. "TRM" o "INFLACIÓN". */
  code: string;
  /** Valor formateado, p. ej. "$4.123" o "5,2%". */
  value?: string;
  /** Variación numérica (define el color verde/rojo). */
  change?: number;
  /** Variación formateada, p. ej. "+0,32%". */
  changeLabel?: string;
}

export interface TickerResponse {
  items: TickerItem[];
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ColombiaIndicators {
  inflation: number;
  gdpGrowth: number;
  unemployment: number;
  interestRate: number;
  exchangeRate: number;
  consumerConfidence: number;
  lastUpdated: string;
  sources: string[];
}

export interface ViewMetrics {
  title: string;
  metrics: SectorMetric[];
}
