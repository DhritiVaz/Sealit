"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { OpportunityScore } from "@/components/OpportunityScore";
import { ProblemDetailSidebar } from "@/components/ProblemDetailSidebar";
import { ProgressBar, fmt } from "@/components/ProgressBar";
import { SourceTag } from "@/components/SourceTag";
import { avatarColors } from "@/lib/domain-images";
import {
  getOnboarding,
  saveProblem,
  unsaveProblem,
  isProblemSaved,
  startBuilding,
  isBuilding,
} from "@/lib/storage";
import { useNavCounts } from "@/lib/use-nav-counts";
import { resolveUserStack } from "@/lib/user-stack";
import type { BuildIdea, Problem } from "@/lib/types";

const GENERIC_STACK = /general web|web development|your stack|modern stack|full.?stack|typical stack/i;

function EngagementRow({ problem }: { problem: Problem }) {
  const colors = avatarColors(problem.id);
  const initials = ["JK", "AM", "RS", "TL"];
  const extra = Math.max(0, problem.builders_count - 4);

  return (
    <div className="mb-10 rounded-xl border border-[#EBEBEB] bg-white px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {colors.map((bg, i) => (
              <div
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white"
                style={{ backgroundColor: bg }}
              >
                {initials[i]}
              </div>
            ))}
            {extra > 0 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#F0F0EE] text-[9px] font-bold text-[#888884]">
                +{extra > 999 ? `${Math.floor(extra / 1000)}k` : extra}
              </div>
            )}
          </div>
          <span className="text-[13px] text-[#888884]">
            {fmt(problem.builders_count)} builders engaged
          </span>
        </div>
        <div className="flex items-center gap-4 min-w-[180px]">
          <div className="flex-1">
            <ProgressBar pct={problem.builders_started_pct} height={4} />
          </div>
          <span className="shrink-0 text-[12px] font-semibold text-[#555550]">
            {problem.builders_started_pct}% started building
          </span>
        </div>
      </div>
    </div>
  );
}

function BuildIdeaCard({
  idea,
  index,
  stackUsed,
}: {
  idea: BuildIdea;
  index: number;
  stackUsed: string[];
}) {
  const stackLabel =
    idea.stackMatch && !GENERIC_STACK.test(idea.stackMatch)
      ? idea.stackMatch
      : stackUsed.length >= 2
        ? `${stackUsed[index % stackUsed.length]} + ${stackUsed[(index + 1) % stackUsed.length]}`
        : stackUsed.join(" + ");

  return (
    <div className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="mb-1.5 text-[15px] font-semibold text-foreground">{idea.title}</h4>
        <p className="mb-2 text-[13px] leading-relaxed text-[#666662]">{idea.description}</p>
        <p className="text-[11px] font-semibold text-primary">Stack: {stackLabel}</p>
      </div>
      <svg
        className="mt-1 shrink-0 text-[#CCCCCA]"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );
}

export default function ProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { savedCount, buildingCount, refresh: refreshNavCounts } = useNavCounts();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [related, setRelated] = useState<Problem[]>([]);
  const [saved, setSaved] = useState(false);
  const [building, setBuilding] = useState(false);
  const [ideas, setIdeas] = useState<BuildIdea[]>([]);
  const [stackUsed, setStackUsed] = useState<string[]>([]);
  const [userStack, setUserStack] = useState<string[]>([]);
  const [hasOwnStack, setHasOwnStack] = useState(false);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    setBuilding(isBuilding(id));

    fetch(`/api/problems/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setProblem(d.problem);
        setSaved(isProblemSaved(id));

        fetch("/api/problems")
          .then((r) => r.json())
          .then((allData) => {
            const all: Problem[] = allData.problems ?? [];
            const rel = all
              .filter((p) => p.id !== id && p.domain === d.problem?.domain)
              .slice(0, 3);
            if (rel.length < 3) {
              const extra = all
                .filter((p) => p.id !== id && !rel.some((r) => r.id === p.id))
                .slice(0, 3 - rel.length);
              rel.push(...extra);
            }
            setRelated(rel);
          });
      });

    const onboarding = getOnboarding();
    const stack = onboarding?.stack ?? [];
    setUserStack(resolveUserStack(stack));
    setHasOwnStack(stack.length > 0);

    setLoadingIdeas(true);
    fetch("/api/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemId: id, stack }),
    })
      .then((r) => r.json())
      .then((d) => {
        setIdeas(d.ideas ?? []);
        setStackUsed(d.stackUsed ?? resolveUserStack(stack));
      })
      .finally(() => setLoadingIdeas(false));
  }, [id]);

  function toggleSave() {
    if (saved) {
      unsaveProblem(id);
      setSaved(false);
    } else {
      saveProblem(id);
      setSaved(true);
    }
    refreshNavCounts();
  }

  function handleBuild() {
    if (!isBuilding(id)) {
      startBuilding(id);
      setBuilding(true);
      refreshNavCounts();
    }
    router.push(`/building/${id}`);
  }

  if (!problem) {
    return (
      <AppShell savedCount={savedCount} buildingCount={buildingCount}>
        <div className="py-20 text-center text-muted">Loading…</div>
      </AppShell>
    );
  }

  return (
    <AppShell savedCount={savedCount} buildingCount={buildingCount}>
      <div className="mx-auto flex max-w-[1100px] gap-8 px-6 py-8 lg:px-10">
        {/* Main column */}
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/feed"
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#888884] transition-colors hover:text-foreground"
            >
              ← Back to feed
            </Link>
            <div className="flex gap-2">
              <button
                onClick={toggleSave}
                className={`rounded-lg border px-4 py-2 text-[13px] font-semibold transition-all ${
                  saved
                    ? "border-primary bg-primary-light text-primary"
                    : "border-[#EBEBEB] bg-white text-foreground hover:border-[#CCCCCA]"
                }`}
              >
                {saved ? "Saved ✓" : "Save"}
              </button>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded bg-primary-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              {problem.domain}
            </span>
            <SourceTag source={problem.source} />
            {problem.opportunity_score && (
              <OpportunityScore score={problem.opportunity_score} />
            )}
            <DifficultyBadge difficulty={problem.difficulty} />
            {problem.time_estimate && (
              <span className="rounded bg-[#F0F0EE] px-2.5 py-1 text-[10px] font-semibold text-[#888884]">
                {problem.time_estimate}
              </span>
            )}
          </div>

          <h1 className="mb-6 text-[32px] font-bold leading-tight tracking-tight text-foreground lg:text-[36px]">
            {problem.headline}
          </h1>

          <EngagementRow problem={problem} />

          <div className="mb-8">
            <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#AAAAAA]">
              The Problem
            </h2>
            <p className="text-[15px] leading-[1.78] text-[#444440]">{problem.context}</p>
          </div>

          <div className="mb-8">
            <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#AAAAAA]">
              What&apos;s Been Tried
            </h2>
            <div className="rounded-xl bg-[#F7F7F5] px-5 py-4">
              <p className="text-[14px] leading-relaxed text-[#666662]">{problem.tried_before}</p>
            </div>
          </div>

          <div className="mb-8 rounded-xl bg-primary-light p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">
                What You Could Build
              </h2>
              <div className="flex flex-wrap items-center gap-1.5">
                {(stackUsed.length > 0 ? stackUsed : userStack).map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold text-primary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            {!hasOwnStack && (
              <p className="mb-4 text-[12px] text-primary/70">
                <Link href="/onboarding" className="font-semibold underline hover:no-underline">
                  Set your stack
                </Link>{" "}
                for even sharper suggestions — showing demo stack for now.
              </p>
            )}

            {loadingIdeas ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-white/60 p-4 h-[88px]" />
                ))}
                <p className="text-[13px] text-primary/60">
                  Gemini is generating ideas for {userStack.slice(0, 3).join(", ")}…
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {ideas.map((idea, i) => (
                  <BuildIdeaCard
                    key={i}
                    idea={idea}
                    index={i}
                    stackUsed={stackUsed.length > 0 ? stackUsed : userStack}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleBuild}
            className="mb-8 w-full rounded-xl bg-foreground py-4 text-[16px] font-bold text-white transition-opacity hover:opacity-90"
          >
            {building ? "View build tracker →" : "I'm building this"}
          </button>

          <button
            onClick={() => setShowRaw(!showRaw)}
            className="mb-4 text-[13px] font-medium text-primary hover:underline"
          >
            {showRaw ? "Hide" : "Show"} raw source post (demo)
          </button>

          {showRaw && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#EBEBEB] bg-[#FAFAF8] p-5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#AAAAAA]">
                  Raw Post
                </p>
                <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-[#555550]">
                  {problem.raw_post}
                </pre>
                <a
                  href={problem.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs text-primary hover:underline"
                >
                  View original →
                </a>
              </div>
              <div className="rounded-xl border border-primary/20 bg-white p-5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-primary">
                  Gemini Structured Card
                </p>
                <p className="mb-2 text-sm font-bold">{problem.headline}</p>
                <p className="mb-3 text-[13px] text-muted">{problem.description}</p>
                <div className="flex gap-2">
                  <DifficultyBadge difficulty={problem.difficulty} />
                  {problem.opportunity_score && (
                    <OpportunityScore score={problem.opportunity_score} />
                  )}
                </div>
              </div>
            </div>
          )}

          {(problem.tags ?? []).length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {problem.tags!.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-[#EBEBEB] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#888884]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="hidden lg:block">
          <ProblemDetailSidebar problem={problem} related={related} />
        </div>
      </div>
    </AppShell>
  );
}
