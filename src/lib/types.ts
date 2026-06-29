export type Difficulty = "Easy" | "Medium" | "Hard";
export type Source = "reddit" | "hn";
export type BuilderGoal = "side_project" | "hackathon" | "startup";

export interface Problem {
  id: string;
  headline: string;
  description: string;
  domain: string;
  difficulty: Difficulty;
  context: string;
  tried_before: string;
  builders_count: number;
  builders_started_pct: number;
  source: Source;
  source_url: string;
  raw_post: string;
  time_estimate?: string;
  tags?: string[];
  opportunity_score?: number;
  cover_image?: string;
  created_at: string;
}

export type BuildStage = "idea" | "mvp" | "shipped";

export interface BuildingProblem {
  id: string;
  startedAt: string;
  stage?: BuildStage;
}

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

export interface OnboardingProfile {
  stack: string[];
  domains: string[];
  goal: BuilderGoal;
  completed: boolean;
}

export interface SavedProblem {
  id: string;
  savedAt: string;
}

export interface RawPost {
  title: string;
  body: string;
  url: string;
  source: Source;
  subreddit?: string;
}

export interface StructuredProblem {
  headline: string;
  description: string;
  domain: string;
  difficulty: Difficulty;
  context: string;
  tried_before: string;
  time_estimate: string;
  tags: string[];
  opportunity_score?: number;
}

export interface BuildIdea {
  title: string;
  description: string;
  stackMatch: string;
}
