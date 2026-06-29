"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Problem } from "@/lib/types";
import { avatarColors, getCoverImage, getDomainGradient } from "@/lib/domain-images";
import { DifficultyBadge } from "./DifficultyBadge";
import { OpportunityScore } from "./OpportunityScore";
import { ProgressBar, fmt } from "./ProgressBar";
import { SourceTag } from "./SourceTag";

function CoverImage({
  problem,
  className = "",
}: {
  problem: Problem;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = problem.cover_image ?? getCoverImage(problem.id);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ background: getDomainGradient(problem.domain) }}
      >
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">
          {problem.domain}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={`object-cover ${className}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function BuilderAvatars({ id, count }: { id: string; count: number }) {
  const colors = avatarColors(id);
  const initials = ["JK", "AM", "RS"];

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {colors.map((bg, i) => (
          <div
            key={i}
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold text-white"
            style={{ backgroundColor: bg }}
          >
            {initials[i]}
          </div>
        ))}
      </div>
      <span className="text-xs text-[#888884]">
        {fmt(count)} builders engaged
      </span>
    </div>
  );
}

export function ProblemCard({
  problem,
  saved,
  building,
  onSave,
  onBuild,
  viewMode = "grid",
}: {
  problem: Problem;
  saved?: boolean;
  building?: boolean;
  onSave?: (e: React.MouseEvent) => void;
  onBuild?: (e: React.MouseEvent) => void;
  viewMode?: "grid" | "list";
}) {
  const router = useRouter();
  const score = problem.opportunity_score ?? 75;

  if (viewMode === "list") {
    return (
      <article className="group flex gap-5 rounded-xl border border-[#EBEBEB] bg-white p-4 transition-colors hover:border-[#CCCCCA]">
        <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-lg">
          <CoverImage problem={problem} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {problem.domain}
            </span>
            <SourceTag source={problem.source} />
            <OpportunityScore score={score} />
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
          <button
            type="button"
            onClick={() => router.push(`/problem/${problem.id}`)}
            className="w-full text-left"
          >
            <h3 className="mb-1.5 text-lg font-bold tracking-tight text-foreground group-hover:text-primary">
              {problem.headline}
            </h3>
            <p className="mb-3 line-clamp-2 text-sm text-muted">{problem.description}</p>
          </button>
          <div className="flex items-center justify-between">
            <BuilderAvatars id={problem.id} count={problem.builders_count} />
            <div className="flex gap-2">
              {onSave && (
                <button onClick={onSave} className="text-xs font-semibold text-primary">
                  {saved ? "Saved ✓" : "Save"}
                </button>
              )}
              {onBuild && (
                <button onClick={onBuild} className="text-xs font-semibold text-primary">
                  {building ? "Building ✓" : "I'm building this"}
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full min-h-[340px] flex-col overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white transition-shadow hover:shadow-md">
      <div className="relative h-[120px] shrink-0 overflow-hidden bg-[#F0F0EE]">
        <CoverImage problem={problem} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
        {onSave && (
          <button
            onClick={onSave}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={saved ? "#1B3A6B" : "none"}
              stroke="#1B3A6B"
              strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-primary-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            {problem.domain}
          </span>
          <SourceTag source={problem.source} />
          <OpportunityScore score={score} />
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        <button
          type="button"
          onClick={() => router.push(`/problem/${problem.id}`)}
          className="mb-3 min-h-0 flex-1 text-left"
        >
          <h3 className="mb-1.5 line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-foreground group-hover:text-primary">
            {problem.headline}
          </h3>
          <p className="line-clamp-2 text-[13px] leading-relaxed text-[#888884]">
            {problem.description}
          </p>
        </button>

        <div className="mt-auto shrink-0 space-y-2.5">
          <BuilderAvatars id={problem.id} count={problem.builders_count} />
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar pct={problem.builders_started_pct} height={3} />
            </div>
            <span className="shrink-0 text-[11px] font-medium text-[#BBBBBA]">
              {problem.builders_started_pct}% started building
            </span>
          </div>
          {onBuild && (
            <button
              onClick={onBuild}
              className={`w-full rounded-lg py-2 text-[12px] font-semibold transition-colors ${
                building
                  ? "bg-primary text-white"
                  : "border border-[#EBEBEB] text-primary hover:bg-primary-light"
              }`}
            >
              {building ? "View build tracker →" : "I'm building this"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
