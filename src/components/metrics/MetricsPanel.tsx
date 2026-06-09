"use client";

import { useEffect, useState } from "react";
import type { NavView } from "@/types";
import { VIEW_METRICS } from "@/lib/constants";
import { MetricCard } from "./MetricCard";

interface MetricsPanelProps {
  activeView: NavView;
}

interface RealIndicators {
  inflation: number;
  gdpGrowth: number;
  unemployment: number;
  interestRate: number;
  lastUpdated: string;
}

export function MetricsPanel({ activeView }: MetricsPanelProps) {
  const [indicators, setIndicators] = useState<RealIndicators | null>(null);
  const viewData = VIEW_METRICS[activeView];

  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => r.json())
      .then(setIndicators)
      .catch(() => null);
  }, []);

  const enrichedMetrics = viewData.metrics.map((metric) => {
    if (!indicators) return metric;

    if (metric.id === "valorization" && activeView === "estrategia") {
      return {
        ...metric,
        value: String(Math.round(80 + indicators.gdpGrowth * 1.5 * 10) / 10),
      };
    }
    if (metric.id === "inflation-forecast" && activeView === "predicciones") {
      return {
        ...metric,
        value: String(Math.max(3.5, indicators.inflation - 0.7)),
      };
    }
    if (metric.id === "gdp-forecast" && activeView === "predicciones") {
      return {
        ...metric,
        value: String(indicators.gdpGrowth + 0.4),
      };
    }
    return metric;
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-skaut-text">
          {viewData.title}
        </h2>
        {indicators && (
          <span className="text-[10px] text-skaut-muted">
            Actualizado: {new Date(indicators.lastUpdated).toLocaleDateString("es-CO")}
          </span>
        )}
      </div>

      {indicators && (
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
          <div className="text-center">
            <p className="text-[10px] text-skaut-muted">Inflación</p>
            <p className="text-sm font-bold text-skaut-text">{indicators.inflation}%</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-skaut-muted">PIB</p>
            <p className="text-sm font-bold text-skaut-text">{indicators.gdpGrowth}%</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-skaut-muted">Desempleo</p>
            <p className="text-sm font-bold text-skaut-text">{indicators.unemployment}%</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {enrichedMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
}
