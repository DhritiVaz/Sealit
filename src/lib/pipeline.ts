import { scrapeAllSources } from "./scraper";
import { structureProblem } from "./gemini";
import {
  insertProblem,
  problemExistsByUrl,
  isSupabaseConfigured,
} from "./supabase";
import {
  addMemoryProblem,
  memoryProblemExists,
  getMemoryProblems,
} from "./seed-data";
import type { Problem } from "./types";
import { enrichProblem } from "./opportunity-score";

export async function runScrapePipeline(): Promise<{
  scraped: number;
  added: Problem[];
  errors: string[];
}> {
  const posts = await scrapeAllSources();
  const added: Problem[] = [];
  const errors: string[] = [];

  for (const post of posts) {
    try {
      const exists = isSupabaseConfigured()
        ? await problemExistsByUrl(post.url)
        : memoryProblemExists(post.url);

      if (exists) continue;

      const structured = await structureProblem(post);
      if (!structured) {
        errors.push(`Failed to structure: ${post.title}`);
        continue;
      }

      const problemData = {
        headline: structured.headline,
        description: structured.description,
        domain: structured.domain,
        difficulty: structured.difficulty,
        context: structured.context,
        tried_before: structured.tried_before,
        builders_count: Math.floor(Math.random() * 500) + 50,
        builders_started_pct: Math.floor(Math.random() * 30) + 5,
        source: post.source,
        source_url: post.url,
        raw_post: `${post.title}\n\n${post.body}`,
        time_estimate: structured.time_estimate,
        tags: structured.tags,
        opportunity_score: structured.opportunity_score,
      };

      if (isSupabaseConfigured()) {
        const inserted = await insertProblem(problemData);
        if (inserted) added.push(inserted);
      } else {
        added.push(addMemoryProblem(problemData));
      }
    } catch (err) {
      errors.push(`Error processing ${post.title}: ${err}`);
    }
  }

  return { scraped: posts.length, added, errors };
}

export async function getAllProblems(): Promise<Problem[]> {
  if (isSupabaseConfigured()) {
    const { fetchProblems } = await import("./supabase");
    const problems = await fetchProblems();
    if (problems.length > 0) return problems.map(enrichProblem);
  }
  return getMemoryProblems().map(enrichProblem);
}

export async function getProblem(id: string): Promise<Problem | null> {
  if (isSupabaseConfigured()) {
    const { fetchProblemById } = await import("./supabase");
    const problem = await fetchProblemById(id);
    if (problem) return enrichProblem(problem);
  }
  const { getMemoryProblem } = await import("./seed-data");
  const problem = getMemoryProblem(id);
  return problem ? enrichProblem(problem) : null;
}
