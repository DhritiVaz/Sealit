import { NextResponse } from "next/server";
import { getAllProblems } from "@/lib/pipeline";
import { getTotalBuilders } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const problems = await getAllProblems();
  const totalBuilders = problems.reduce((s, p) => s + p.builders_count, 0);

  return NextResponse.json({
    totalBuilders: totalBuilders || getTotalBuilders(),
    problemCount: problems.length,
    lastUpdated: new Date().toISOString(),
  });
}
