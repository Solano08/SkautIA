export type NavView = "estrategia" | "seguridad" | "inteligencia" | "predicciones";

export type SidebarSection =
  | "datos"
  | "capas"
  | "proyectos"
  | "historial"
  | "carteras";

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
