"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { FeedToolbar } from "@/components/FeedToolbar";
import { NewProblemToast } from "@/components/NewProblemToast";
import { ProblemCard } from "@/components/ProblemCard";
import { useSidebar } from "@/components/SidebarContext";
import {
  getOnboarding,
  getSavedProblems,
  getBuildingProblems,
  saveProblem,
  unsaveProblem,
  startBuilding,
  isBuilding,
} from "@/lib/storage";
import { useNavCounts } from "@/lib/use-nav-counts";
import type { Problem } from "@/lib/types";

export default function FeedPage() {
  const { savedCount, buildingCount } = useNavCounts();

  return (
    <AppShell savedCount={savedCount} buildingCount={buildingCount}>
      <FeedContent />
    </AppShell>
  );
}

function FeedContent() {
  const router = useRouter();
  const { selectedCategory } = useSidebar();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [buildingIds, setBuildingIds] = useState<Set<string>>(new Set());
  const [newProblem, setNewProblem] = useState<Problem | null>(null);
  const [profile, setProfile] = useState<{ stack: string[]; domains: string[] } | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const knownIds = useRef<Set<string>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const loadProblems = useCallback(async () => {
    const res = await fetch("/api/problems");
    const data = await res.json();
    const fetched: Problem[] = data.problems ?? [];

    for (const p of fetched) {
      if (!knownIds.current.has(p.id) && knownIds.current.size > 0) {
        setNewProblem(p);
        break;
      }
    }
    fetched.forEach((p) => knownIds.current.add(p.id));

    setProblems(fetched);
  }, []);

  useEffect(() => {
    const onboarding = getOnboarding();
    if (onboarding) {
      setProfile({ stack: onboarding.stack, domains: onboarding.domains });
    }
    setSavedIds(new Set(getSavedProblems().map((s) => s.id)));
    setBuildingIds(new Set(getBuildingProblems().map((b) => b.id)));
    loadProblems();

    pollRef.current = setInterval(loadProblems, 15000);
    return () => clearInterval(pollRef.current);
  }, [loadProblems]);

  function handleSave(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (savedIds.has(id)) {
      unsaveProblem(id);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      saveProblem(id);
      setSavedIds((prev) => new Set([...Array.from(prev), id]));
    }
  }

  function handleBuild(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!isBuilding(id)) {
      startBuilding(id);
      setBuildingIds((prev) => new Set([...Array.from(prev), id]));
    }
    router.push(`/building/${id}`);
  }

  async function handleScrape() {
    const before = new Set(knownIds.current);
    const res = await fetch("/api/scrape", { method: "POST" });
    const data = await res.json();
    if (data.added?.length > 0) {
      setNewProblem(data.added[0] as Problem);
      await loadProblems();
    } else {
      await loadProblems();
      const res2 = await fetch("/api/problems");
      const d2 = await res2.json();
      const latest = (d2.problems as Problem[])?.find((p) => !before.has(p.id));
      if (latest) setNewProblem(latest);
    }
  }

  let filtered = [...problems];

  if (selectedCategory) {
    filtered = filtered.filter((p) => p.domain === selectedCategory);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.headline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => {
    if (!profile?.domains.length) return 0;
    const aMatch = profile.domains.includes(a.domain) ? 1 : 0;
    const bMatch = profile.domains.includes(b.domain) ? 1 : 0;
    return bMatch - aMatch;
  });

  const problemCount = problems.length;

  return (
    <>
      {newProblem && (
        <NewProblemToast
          problem={newProblem}
          onDismiss={() => setNewProblem(null)}
        />
      )}

      <FeedToolbar
        search={search}
        onSearchChange={setSearch}
        onScrape={handleScrape}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="px-6 py-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
              Live problems, scraped in the last 24 hours
            </p>
            <h1 className="text-[26px] font-bold tracking-tight text-foreground">
              {problemCount > 0 ? `${problemCount} open problems today` : "Loading problems…"}
            </h1>
            <p className="mt-1 text-[13px] text-[#AAAAAA]">
              Sourced from Reddit & Hacker News · Refreshed every 30 min
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center text-muted">
            {problems.length === 0 ? "Loading problems…" : "No problems match your filters."}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <ProblemCard
                key={p.id}
                problem={p}
                saved={savedIds.has(p.id)}
                building={buildingIds.has(p.id)}
                onSave={(e) => handleSave(e, p.id)}
                onBuild={(e) => handleBuild(e, p.id)}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((p) => (
              <ProblemCard
                key={p.id}
                problem={p}
                saved={savedIds.has(p.id)}
                building={buildingIds.has(p.id)}
                onSave={(e) => handleSave(e, p.id)}
                onBuild={(e) => handleBuild(e, p.id)}
                viewMode="list"
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
