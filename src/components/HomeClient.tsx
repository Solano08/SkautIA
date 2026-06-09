"use client";

import dynamic from "next/dynamic";

const Dashboard = dynamic(
  () => import("@/components/Dashboard").then((mod) => mod.Dashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-sm text-slate-500 dark:bg-[#0b1120] dark:text-slate-400">
        Cargando Skaut IA…
      </div>
    ),
  }
);

export function HomeClient() {
  return <Dashboard />;
}
