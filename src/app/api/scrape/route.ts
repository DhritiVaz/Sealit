import { NextRequest, NextResponse } from "next/server";
import { runScrapePipeline } from "@/lib/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function verifyAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;
  // Allow manual trigger in dev/demo without secret
  if (process.env.NODE_ENV === "development") return true;
  // Vercel cron sends this header
  if (req.headers.get("x-vercel-cron")) return true;
  return !cronSecret;
}

export async function POST(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runScrapePipeline();
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  return POST(req);
}
