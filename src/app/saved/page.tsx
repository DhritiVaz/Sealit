"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { getSavedProblems } from "@/lib/storage";
import { useNavCounts } from "@/lib/use-nav-counts";
import type { Problem } from "@/lib/types";

function formatSavedDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SavedPage() {
  const [saved, setSaved] = useState<{ problem: Problem; savedAt: string }[]>([]);
  const { savedCount, buildingCount } = useNavCounts();

  useEffect(() => {
    async function load() {
      const savedList = getSavedProblems();
      const results: { problem: Problem; savedAt: string }[] = [];

      for (const s of savedList) {
        const res = await fetch(`/api/problems/${s.id}`);
        if (res.ok) {
          const data = await res.json();
          results.push({ problem: data.problem, savedAt: s.savedAt });
        }
      }
      setSaved(results);
    }
    load();
  }, []);

  return (
    <AppShell savedCount={savedCount} buildingCount={buildingCount}>
      <div className="mx-auto max-w-[820px] px-15 py-13">
        <div className="mb-9 border-b border-border pb-6">
          <h1 className="mb-1 text-[28px] font-bold tracking-tight text-foreground">Saved</h1>
          <p className="text-[13px] text-[#AAAAAA]">
            {saved.length === 0
              ? "No problems bookmarked"
              : `${saved.length} problem${saved.length === 1 ? "" : "s"} bookmarked`}
          </p>
        </div>

        {saved.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#EBEBEB]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CCCCCA" strokeWidth="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="mb-2 text-lg font-semibold tracking-tight text-foreground">Nothing saved yet</p>
            <p className="mx-auto max-w-[280px] text-sm leading-relaxed text-[#AAAAAA]">
              Click Save on any problem in your feed to bookmark it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {saved.map(({ problem, savedAt }) => (
              <Link
                key={problem.id}
                href={`/problem/${problem.id}`}
                className="block rounded-[10px] border border-border bg-white p-5 transition-colors hover:border-[#CCCCCA]"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                    {problem.domain}
                  </span>
                  <DifficultyBadge difficulty={problem.difficulty} />
                </div>
                <p className="mb-4 line-clamp-3 text-sm font-semibold leading-snug tracking-tight text-foreground">
                  {problem.headline}
                </p>
                <ProgressBar pct={problem.builders_started_pct} />
                <div className="mt-2 text-[10px] text-[#BBBBBA]">
                  Saved {formatSavedDate(savedAt)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
