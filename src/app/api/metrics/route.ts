import { NextResponse } from "next/server";
import { fetchColombiaIndicators } from "@/lib/data/colombia-metrics";

export async function GET() {
  const indicators = await fetchColombiaIndicators();
  return NextResponse.json(indicators);
}
