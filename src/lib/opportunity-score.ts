import type { Problem } from "./types";
import { getCoverImage } from "./domain-images";

export function computeOpportunityScore(problem: {
  difficulty: string;
  builders_count: number;
  builders_started_pct: number;
  domain: string;
  headline: string;
}): number {
  let score = 50;

  const diffBonus: Record<string, number> = { Easy: 15, Medium: 10, Hard: 0 };
  score += diffBonus[problem.difficulty] ?? 5;

  score += Math.min(20, Math.floor(problem.builders_count / 100));

  const gap = 100 - problem.builders_started_pct;
  score += Math.min(15, Math.floor(gap / 4));

  const hotDomains = ["Health", "FinTech", "Dev Tools", "Climate", "AI"];
  if (hotDomains.some((d) => problem.domain.includes(d))) score += 8;

  const hash = problem.headline.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  score += hash % 12;

  return Math.min(99, Math.max(62, score));
}

export function enrichProblem(problem: Problem): Problem {
  const match = problem.id.match(/(\d+)$/);
  const index = match ? parseInt(match[1], 10) - 1 : undefined;
  return {
    ...problem,
    opportunity_score:
      problem.opportunity_score ?? computeOpportunityScore(problem),
    cover_image: problem.cover_image ?? getCoverImage(problem.id, index),
  };
}
