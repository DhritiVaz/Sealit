"use client";

import { useEffect, useState } from "react";

export function LiveCounter({ className = "" }: { className?: string }) {
  const [count, setCount] = useState(10448);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.totalBuilders) setCount(d.totalBuilders);
      })
      .catch(() => {});

    const interval = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 3));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={className}>
      {count.toLocaleString()} builders · problems scraped live · Updated every 30 min
    </span>
  );
}

export function ScrapeTrigger({
  onTrigger,
  compact = false,
}: {
  onTrigger?: () => Promise<void>;
  compact?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function trigger() {
    setLoading(true);
    try {
      await onTrigger?.();
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <>
        <button
          onClick={trigger}
          disabled={loading}
          aria-label="Run scraper"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EBEBEB] bg-white text-sm transition-colors hover:bg-[#FAFAF8] disabled:opacity-50 sm:hidden"
        >
          {loading ? "…" : "⚡"}
        </button>
        <button
          onClick={trigger}
          disabled={loading}
          className="hidden items-center gap-1.5 rounded-lg border border-[#EBEBEB] bg-white px-3 py-1.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-[#FAFAF8] disabled:opacity-50 sm:flex"
        >
          <span className="text-[12px]">⚡</span>
          {loading ? "Scraping…" : "Scrape"}
        </button>
      </>
    );
  }

  return (
    <button
      onClick={trigger}
      disabled={loading}
      className="flex shrink-0 items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-50"
    >
      <span>⚡</span>
      {loading ? "Scraping…" : "Run scraper"}
    </button>
  );
}
