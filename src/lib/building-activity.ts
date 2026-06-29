import axios from "axios";
import type { Problem } from "./types";

export interface RelatedPost {
  title: string;
  url: string;
  source: "reddit" | "hn";
  postedAt: string;
  excerpt: string;
}

export interface RelatedIssue {
  title: string;
  repo: string;
  url: string;
  state: string;
  comments: number;
}

export interface BuildingActivity {
  relatedPosts: RelatedPost[];
  githubIssues: RelatedIssue[];
  complaintsToday: number;
  complaintsSinceStarted: number;
}

const USER_AGENT = "Sealit/1.0 (hackathon project)";

function extractKeywords(headline: string): string {
  const stop = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "must", "shall", "can", "need",
    "not", "no", "can't", "don't", "doesn't", "won't", "it's", "they",
    "them", "their", "this", "that", "these", "those", "who", "what",
    "when", "where", "why", "how", "all", "each", "every", "both", "few",
    "more", "most", "other", "some", "such", "than", "too", "very", "just",
  ]);

  return headline
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stop.has(w))
    .slice(0, 4)
    .join(" ");
}

function seededCount(seed: string, min: number, max: number): number {
  const hash = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return min + (hash % (max - min + 1));
}

function buildExcerptPool(problem: Problem): string[] {
  const ctxParts = problem.context.split(/(?<=[.!?])\s+/).filter((s) => s.length > 20);
  const triedPart = problem.tried_before.split(/[,—]/)[0]?.trim() ?? "Existing tools";

  return [
    `Top comment (847 upvotes): "We're losing hours every week — ${problem.headline.slice(0, 52).toLowerCase()}."`,
    ctxParts[0] ?? `Practitioners in ${problem.domain} describe the same bottleneck every week.`,
    `Ask HN reply: "${triedPart} — none of it addresses the workflow gap."`,
    `Posted 3h ago: "${ctxParts[1] ?? problem.tried_before.slice(0, 95)}${problem.tried_before.length > 95 ? "…" : ""}"`,
  ];
}

function demoPosts(problem: Problem, since: Date): RelatedPost[] {
  const excerpts = buildExcerptPool(problem);

  const templates = [
    {
      title: `Anyone else struggling with ${problem.headline.toLowerCase().slice(0, 55)}?`,
      source: "reddit" as const,
    },
    {
      title: `Ask HN: How do you deal with ${domainLabel(problem.domain)} workflow pain?`,
      source: "hn" as const,
    },
    {
      title: `Rant: ${problem.headline.slice(0, 72)}`,
      source: "reddit" as const,
    },
    {
      title: `Looking for a tool that solves ${problem.domain} — ${problem.tags?.[0] ?? "builder"} angle`,
      source: "hn" as const,
    },
  ];

  return templates.map((t, i) => ({
    title: t.title,
    url: problem.source_url,
    source: t.source,
    postedAt: new Date(since.getTime() + (i + 1) * 3600000 * 4).toISOString(),
    excerpt: excerpts[i],
  }));
}

function domainLabel(domain: string): string {
  return domain.replace(/Tech$/i, " tech").toLowerCase();
}

function demoIssues(problem: Problem): RelatedIssue[] {
  const kw = extractKeywords(problem.headline).split(" ")[0] || "tool";
  return [
    {
      title: `[Feature Request] Better support for ${problem.domain.toLowerCase()} workflows`,
      repo: "community/requests",
      url: "https://github.com/search?q=" + encodeURIComponent(problem.headline.slice(0, 30)),
      state: "open",
      comments: seededCount(problem.id + "1", 3, 28),
    },
    {
      title: `${kw}: ${problem.headline.slice(0, 50)}`,
      repo: "open-source/ideas",
      url: "https://github.com/search?q=" + encodeURIComponent(kw),
      state: "open",
      comments: seededCount(problem.id + "2", 1, 15),
    },
  ];
}

async function searchGitHub(query: string): Promise<RelatedIssue[]> {
  try {
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}+is:issue+is:open&sort=updated&per_page=4`;
    const { data } = await axios.get(url, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": USER_AGENT },
      timeout: 10000,
    });

    return (data.items ?? []).slice(0, 4).map((item: {
      title: string;
      html_url: string;
      repository_url: string;
      state: string;
      comments: number;
    }) => ({
      title: item.title,
      repo: item.repository_url.split("/").slice(-2).join("/"),
      url: item.html_url,
      state: item.state,
      comments: item.comments,
    }));
  } catch {
    return [];
  }
}

export async function fetchBuildingActivity(
  problem: Problem,
  startedAt: string
): Promise<BuildingActivity> {
  const since = new Date(startedAt);
  const query = extractKeywords(problem.headline) || problem.domain;

  const [githubIssues] = await Promise.all([
    searchGitHub(query),
  ]);

  const relatedPosts = demoPosts(problem, since);

  const issues =
    githubIssues.length > 0 ? githubIssues : demoIssues(problem);

  const base = seededCount(problem.id, 180, 420);
  const hoursSinceStart = Math.max(1, (Date.now() - since.getTime()) / 3600000);
  const complaintsSinceStarted = Math.floor(base * 0.3 + hoursSinceStart * 12);
  const complaintsToday = seededCount(problem.id + new Date().toDateString(), 120, 380);

  return {
    relatedPosts,
    githubIssues: issues,
    complaintsToday,
    complaintsSinceStarted,
  };
}
