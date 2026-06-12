"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip } from "recharts";

interface MetricSparklineProps {
  data: { name: string; value: number }[];
}

export function MetricSparkline({ data }: MetricSparklineProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <Tooltip
          contentStyle={{
            fontSize: 11,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
          }}
        />
        <Bar dataKey="value" fill="#3b82f6" radius={[3, 3, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
