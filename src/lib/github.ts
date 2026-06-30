export interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string;
  company: string | null;
  blog: string | null;
  public_repos: number;
  html_url: string;
}

export interface GitHubRepo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  topics: string[];
  private: boolean;
  fork: boolean;
  updated_at: string;
}

function ghHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "SealIt/1.0",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers["Authorization"] = `token ${token}`;
  return headers;
}

export function extractGitHubUsername(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("github.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return null;
    // Exclude known non-username paths
    if (["orgs", "repos", "explore", "trending", "topics"].includes(parts[0])) return null;
    return parts[0];
  } catch {
    return null;
  }
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser | null> {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: ghHeaders(),
  });
  if (!res.ok) return null;
  return (await res.json()) as GitHubUser;
}

export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&type=public`,
    { headers: ghHeaders() }
  );
  if (!res.ok) return [];
  const repos = (await res.json()) as GitHubRepo[];
  return repos.filter((r) => !r.fork);
}

export async function fetchReadme(owner: string, repo: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers: ghHeaders(),
  });
  if (!res.ok) return "";
  try {
    const data = (await res.json()) as { content: string };
    return Buffer.from(data.content, "base64").toString("utf-8").slice(0, 4000);
  } catch {
    return "";
  }
}

export function buildRepoSummary(repos: GitHubRepo[]): string {
  const langs = repos
    .map((r) => r.language)
    .filter((l): l is string => Boolean(l));
  const topics = repos.flatMap((r) => r.topics ?? []);
  const langCounts: Record<string, number> = {};
  for (const l of langs) langCounts[l] = (langCounts[l] ?? 0) + 1;
  const topLangs = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([l]) => l);
  const uniqueTopics = Array.from(new Set(topics)).slice(0, 10);
  return `Languages: ${topLangs.join(", ")}. Topics: ${uniqueTopics.join(", ")}. Repos: ${repos.map((r) => r.name).join(", ")}.`;
}
