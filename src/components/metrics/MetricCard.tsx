"use client";

import dynamic from "next/dynamic";
import clsx from "clsx";
import type { SectorMetric } from "@/types";

// recharts pesa ~100 KB gzip: se carga después del primer render para no
// bloquear el bundle crítico del dashboard (mapa incluido).
const MetricSparkline = dynamic(
  () => import("./MetricSparkline").then((mod) => mod.MetricSparkline),
  { ssr: false, loading: () => null }
);

interface MetricCardProps {
  metric: SectorMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  const isPositive = metric.change >= 0;
  const chartData = metric.chartData?.map((v, i) => ({ name: `${i}`, value: v }));

  return (
    <div className="rounded-2xl border border-skaut-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-skaut-muted">{metric.label}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-skaut-text">{metric.value}</span>
            {metric.unit && (
              <span className="text-sm text-skaut-muted">{metric.unit}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {metric.riskLevel ? (
            <span
              className={clsx(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                metric.riskLevel === "BAJO" && "bg-emerald-100 text-emerald-700",
                metric.riskLevel === "MEDIO" && "bg-amber-100 text-amber-700",
                metric.riskLevel === "ALTO" && "bg-red-100 text-red-700"
              )}
            >
              {metric.riskLevel}
            </span>
          ) : (
            <span
              className={clsx(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                isPositive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {metric.changeLabel}
            </span>
          )}
          {metric.riskLevel && (
            <span className="text-[10px] text-skaut-muted">{metric.changeLabel}</span>
          )}
        </div>
      </div>

      {metric.progress !== undefined && (
        <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-skaut-blue to-skaut-sky transition-all duration-700"
            style={{ width: `${metric.progress}%` }}
          />
        </div>
      )}

      {chartData && (
        <div className="h-12">
          <MetricSparkline data={chartData} />
        </div>
      )}

      <p className="mt-2 text-[10px] text-skaut-muted">Fuente: {metric.source}</p>
    </div>
  );
}
