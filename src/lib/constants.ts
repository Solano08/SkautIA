import type { CityMetric, NavView, ViewMetrics } from "@/types";

export const COLOMBIA_CITIES: CityMetric[] = [
  { code: "BOG", name: "Bogotá", change: -2.4, lat: 4.711, lng: -74.0721 },
  { code: "MDE", name: "Medellín", change: 4.1, lat: 6.2476, lng: -75.5658 },
  { code: "CLO", name: "Cali", change: -0.2, lat: 3.4516, lng: -76.532 },
  { code: "BAQ", name: "Barranquilla", change: 1.8, lat: 10.9685, lng: -74.7813 },
  { code: "CTG", name: "Cartagena", change: 2.3, lat: 10.391, lng: -75.4794 },
];

export const NAV_VIEWS: { id: NavView; label: string }[] = [
  { id: "estrategia", label: "Estrategia" },
  { id: "seguridad", label: "Seguridad" },
  { id: "inteligencia", label: "Inteligencia" },
  { id: "predicciones", label: "Predicciones" },
];

export const SIDEBAR_ITEMS = [
  { id: "datos" as const, label: "Datos", icon: "Database" },
  { id: "capas" as const, label: "Capas e Indicadores", icon: "Layers" },
  { id: "proyectos" as const, label: "Proyectos", icon: "FolderKanban" },
  { id: "historial" as const, label: "Historial e Inflación", icon: "TrendingUp" },
  { id: "carteras" as const, label: "Carteras e Inversión", icon: "Wallet" },
];

export const SIDEBAR_FOOTER_ITEMS = [
  { id: "ajustes" as const, label: "Ajustes", icon: "Settings" },
  { id: "ayuda" as const, label: "Ayuda", icon: "HelpCircle" },
];

export const VIEW_METRICS: Record<NavView, ViewMetrics> = {
  estrategia: {
    title: "Métricas Sectoriales",
    metrics: [
      {
        id: "valorization",
        label: "Índice Valorización",
        value: "84.2",
        unit: "pts",
        change: 12.4,
        changeLabel: "+12.4%",
        progress: 84,
        source: "DANE / Banco de la República",
      },
      {
        id: "commercial",
        label: "Crecimiento Comercial",
        value: "21.5",
        unit: "pts",
        change: 5.8,
        changeLabel: "+5.8%",
        chartData: [12, 15, 14, 18, 19, 21, 21.5],
        source: "Confecámaras / DANE",
      },
      {
        id: "risk",
        label: "Riesgo de Inversión",
        value: "0.12",
        unit: "%",
        change: -0.03,
        changeLabel: "Zona Alpha-4",
        riskLevel: "BAJO",
        source: "Banco de la República",
      },
    ],
  },
  seguridad: {
    title: "Métricas de Seguridad",
    metrics: [
      {
        id: "stability",
        label: "Índice Estabilidad Macro",
        value: "76.8",
        unit: "pts",
        change: 2.1,
        changeLabel: "+2.1%",
        progress: 77,
        source: "Banco de la República",
      },
      {
        id: "volatility",
        label: "Volatilidad Cambiaria",
        value: "3.2",
        unit: "%",
        change: -0.4,
        changeLabel: "-0.4%",
        chartData: [4.1, 3.8, 3.5, 3.4, 3.3, 3.2, 3.2],
        source: "BanRep TRM",
      },
      {
        id: "sovereign",
        label: "Riesgo Soberano",
        value: "BB+",
        unit: "",
        change: 0,
        changeLabel: "Estable",
        riskLevel: "MEDIO",
        source: "Fitch / Moody's",
      },
    ],
  },
  inteligencia: {
    title: "Inteligencia de Mercado",
    metrics: [
      {
        id: "fdi",
        label: "Flujo IED",
        value: "12.4",
        unit: "B USD",
        change: 8.2,
        changeLabel: "+8.2%",
        progress: 72,
        source: "Banco de la República",
      },
      {
        id: "startup",
        label: "Índice Innovación",
        value: "58.3",
        unit: "pts",
        change: 11.5,
        changeLabel: "+11.5%",
        chartData: [42, 45, 48, 52, 54, 56, 58.3],
        source: "iNNpulsa / MinCIT",
      },
      {
        id: "sector-rotation",
        label: "Rotación Sectorial",
        value: "Logística",
        unit: "",
        change: 14.2,
        changeLabel: "+14.2%",
        riskLevel: "BAJO",
        source: "Análisis Skaut IA",
      },
    ],
  },
  predicciones: {
    title: "Predicciones 2025-2026",
    metrics: [
      {
        id: "gdp-forecast",
        label: "PIB Proyectado",
        value: "2.8",
        unit: "%",
        change: 0.3,
        changeLabel: "+0.3pp",
        progress: 65,
        source: "FMI / Banco Mundial",
      },
      {
        id: "inflation-forecast",
        label: "Inflación Esperada",
        value: "4.5",
        unit: "%",
        change: -1.2,
        changeLabel: "-1.2pp",
        chartData: [7.2, 6.8, 6.1, 5.4, 5.0, 4.7, 4.5],
        source: "DANE / BanRep",
      },
      {
        id: "real-estate",
        label: "Plusvalía Inmobiliaria",
        value: "6.7",
        unit: "%",
        change: 1.8,
        changeLabel: "+1.8%",
        riskLevel: "BAJO",
        source: "Lonja / Camacol",
      },
    ],
  },
};

export const INITIAL_AI_MESSAGE = `He detectado una oportunidad de arbitraje en el sector retail de Medellín (El Poblado). La saturación actual sugiere un pivot hacia "Dark Kitchens" o centros de micro-fulfillment. El ROI proyectado para Q3 es del 18.4% con riesgo bajo.

¿Deseas que profundice en algún territorio o sector específico?`;

export const LIVE_FEED = {
  title: "FEED EN VIVO",
  headline: "Concentración de Inversión 2024",
  description:
    "Incremento del 14.2% en el sector logístico del Valle de Aburrá. Nuevos hubs de distribución en Rionegro y Sabaneta.",
  timestamp: new Date().toISOString(),
};
