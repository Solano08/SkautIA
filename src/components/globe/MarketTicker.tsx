import type { CityMetric } from "@/types";

interface MarketTickerProps {
  cities: CityMetric[];
}

export function MarketTicker({ cities }: MarketTickerProps) {
  const items = [...cities, ...cities];

  return (
    <div className="relative overflow-hidden border-t border-skaut-border bg-white/80 py-3 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
      <div className="flex animate-ticker gap-8 whitespace-nowrap">
        {items.map((city, i) => (
          <div key={`${city.code}-${i}`} className="flex items-center gap-2 px-2">
            <span className="text-xs font-bold text-skaut-text">{city.code}</span>
            <span
              className={`text-xs font-semibold ${
                city.change >= 0 ? "text-skaut-success" : "text-skaut-danger"
              }`}
            >
              {city.change >= 0 ? "+" : ""}
              {city.change}%
            </span>
            <span className="text-skaut-border">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
