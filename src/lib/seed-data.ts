import type { Problem } from "./types";
import { SEED_PROBLEMS, generateSeedProblems } from "./generate-seed-problems";

let memoryStore: Problem[] = [...SEED_PROBLEMS];

export function getMemoryProblems(): Problem[] {
  return [...memoryStore].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getMemoryProblem(id: string): Problem | undefined {
  return memoryStore.find((p) => p.id === id);
}

export function addMemoryProblem(
  problem: Omit<Problem, "id" | "created_at">
): Problem {
  const newProblem: Problem = {
    ...problem,
    id: `mem-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  memoryStore = [newProblem, ...memoryStore];
  return newProblem;
}

export function memoryProblemExists(url: string): boolean {
  return memoryStore.some((p) => p.source_url === url);
}

export function getTotalBuilders(): number {
  return memoryStore.reduce((sum, p) => sum + p.builders_count, 0);
}

export { generateSeedProblems, SEED_PROBLEMS };
