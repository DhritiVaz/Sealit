import { NextRequest, NextResponse } from "next/server";
import { generateBuildIdeas } from "@/lib/gemini";
import { getProblem } from "@/lib/pipeline";
import { resolveUserStack } from "@/lib/user-stack";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { problemId, stack } = body as {
    problemId: string;
    stack: string[];
  };

  const problem = await getProblem(problemId);
  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  const stackUsed = resolveUserStack(stack);
  const { ideas } = await generateBuildIdeas(
    {
      headline: problem.headline,
      context: problem.context,
      tried_before: problem.tried_before,
      domain: problem.domain,
    },
    stackUsed
  );

  return NextResponse.json({ ideas, stackUsed });
}
