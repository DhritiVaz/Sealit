import { GoogleGenerativeAI } from "@google/generative-ai";
import type { BuildIdea, RawPost, StructuredProblem } from "./types";
import { resolveUserStack } from "./user-stack";

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

const STRUCTURE_PROMPT = `You are a product analyst for Sealit, a platform that surfaces real unsolved problems for builders.

Given a raw post from Reddit or Hacker News, extract a structured problem card.

Return ONLY valid JSON with this exact shape:
{
  "headline": "One compelling sentence — the core problem",
  "description": "Two sentences max — who it affects and why it matters",
  "domain": "One of: Health, Climate, FinTech, EdTech, AgriTech, LegalTech, CleanTech, Accessibility, Dev Tools, Civic Tech, Mental Health, Housing, Infrastructure, Other",
  "difficulty": "Easy | Medium | Hard",
  "context": "3-4 sentences: who it affects, scale, why it exists",
  "tried_before": "What solutions have been attempted or why existing tools fail",
  "time_estimate": "e.g. 'Weekend MVP' or '2-4 weeks'",
  "tags": ["tag1", "tag2", "tag3"],
  "opportunity_score": 62-99 integer rating how good an opportunity this is for a builder (market pain × feasibility × competition gap)
}`;

export async function structureProblem(
  post: RawPost
): Promise<StructuredProblem | null> {
  const model = getModel();
  if (!model) return fallbackStructure(post);

  const sourceLabel =
    post.source === "reddit"
      ? `Reddit r/${post.subreddit ?? "unknown"}`
      : "Hacker News Ask HN";

  try {
    const result = await model.generateContent([
      STRUCTURE_PROMPT,
      `\nSource: ${sourceLabel}\nTitle: ${post.title}\n\nBody:\n${post.body || "(no body)"}`,
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallbackStructure(post);

    const parsed = JSON.parse(jsonMatch[0]) as StructuredProblem;
    return parsed;
  } catch (err) {
    console.error("Gemini structure error:", err);
    return fallbackStructure(post);
  }
}

function fallbackStructure(post: RawPost): StructuredProblem {
  return {
    headline: post.title.slice(0, 120),
    description:
      post.body?.slice(0, 200) ||
      "A real problem surfaced from the builder community.",
    domain: "Dev Tools",
    difficulty: "Medium",
    context:
      post.body?.slice(0, 500) ||
      "This problem was identified from community discussions where builders expressed unmet needs.",
    tried_before:
      "Existing solutions may partially address this, but community feedback suggests significant gaps remain.",
    time_estimate: "1-2 weeks",
    tags: ["Community", "Builder"],
  };
}

const GENERIC_STACK = /general web|web development|your stack|modern stack|full.?stack|typical stack/i;

function stackCombo(stack: string[], index: number): string {
  const a = stack[index % stack.length];
  const b = stack[(index + 1) % stack.length];
  const c = stack[(index + 2) % stack.length];
  return c && c !== b ? `${a} + ${b} + ${c}` : `${a} + ${b}`;
}

function sanitizeIdeas(ideas: BuildIdea[], stack: string[]): BuildIdea[] {
  return ideas.map((idea, i) => {
    const combo = stackCombo(stack, i);
    let stackMatch = idea.stackMatch?.trim() ?? "";
    if (!stackMatch || GENERIC_STACK.test(stackMatch)) {
      stackMatch = combo;
    }

    let description = idea.description ?? "";
    description = description.replace(GENERIC_STACK, combo);
    for (const tech of stack.slice(0, 4)) {
      if (!description.includes(tech)) {
        description = description.replace(/\.$/, "") + ` Built with ${tech}.`;
        break;
      }
    }

    return { ...idea, stackMatch, description };
  });
}

export async function generateBuildIdeas(
  problem: {
    headline: string;
    context: string;
    tried_before: string;
    domain?: string;
  },
  stack: string[]
): Promise<{ ideas: BuildIdea[]; stackUsed: string[] }> {
  const stackUsed = resolveUserStack(stack);
  const stackStr = stackUsed.join(", ");
  const model = getModel();

  if (!model) {
    return { ideas: sanitizeIdeas(fallbackIdeas(problem, stackUsed), stackUsed), stackUsed };
  }

  const prompt = `You are a technical advisor for builders. The builder's EXACT tech stack is: ${stackStr}

You MUST reference specific technologies from their stack by name in every idea. Do NOT say "general web development" or use vague stack descriptions.

Problem headline: ${problem.headline}
Domain: ${problem.domain ?? "Unknown"}
Context: ${problem.context}
What's been tried: ${problem.tried_before}

Generate exactly 3 specific, actionable project ideas this builder could start THIS WEEKEND.

Rules:
- Each idea must name 2-3 specific technologies from their stack (${stackStr})
- stackMatch field must list the exact stack items used, e.g. "Next.js + Supabase + TypeScript"
- Ideas must be concrete products, not generic advice

Return ONLY valid JSON array:
[
  { "title": "Short project name", "description": "2-3 sentences — what to build, who it's for, why it fits their stack", "stackMatch": "Exact stack items e.g. React + Node.js + PostgreSQL" }
]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return { ideas: sanitizeIdeas(fallbackIdeas(problem, stackUsed), stackUsed), stackUsed };

    const ideas = sanitizeIdeas(JSON.parse(jsonMatch[0]) as BuildIdea[], stackUsed);
    return { ideas, stackUsed };
  } catch (err) {
    console.error("Gemini ideas error:", err);
    return { ideas: sanitizeIdeas(fallbackIdeas(problem, stackUsed), stackUsed), stackUsed };
  }
}

function fallbackIdeas(
  problem: { headline: string; domain?: string },
  stack: string[]
): BuildIdea[] {
  const [a, b, c, d] = stack;
  const ab = [a, b].filter(Boolean).join(" + ");
  const cd = [c, d].filter(Boolean).join(" + ") || b || a;

  return [
    {
      title: `${a} intake MVP`,
      description: `Build a ${a}-based web app that solves the core pain point: ${problem.headline.slice(0, 80)}. Use ${b ?? "your backend"} for the API layer and ship a single happy-path flow this weekend.`,
      stackMatch: ab,
    },
    {
      title: `${problem.domain ?? "Domain"} dashboard`,
      description: `Create a real-time dashboard in ${a} showing problem severity and user demand signals. Store data in ${c ?? "PostgreSQL"} and deploy on ${d ?? "Vercel"}. Validates the problem before you build the full product.`,
      stackMatch: [a, c, d].filter(Boolean).join(" + "),
    },
    {
      title: "AI-assisted workflow tool",
      description: `Combine ${b ?? a} with an LLM API to automate the most painful step in this problem space. ${cd} handles persistence and auth — scoped to one user persona, shippable in a weekend hackathon.`,
      stackMatch: cd,
    },
  ];
}
