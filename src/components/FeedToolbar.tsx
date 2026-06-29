"use client";

import { ScrapeTrigger } from "./LiveCounter";

export function FeedToolbar({
  search,
  onSearchChange,
  onScrape,
  viewMode,
  onViewModeChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  onScrape: () => Promise<void>;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#EBEBEB] bg-white">
      <div className="flex h-14 items-center gap-3 px-4 md:gap-4 md:px-6">
        <div className="relative min-w-0 flex-1">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#BBBBBA]"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search problems, keywords, topics..."
            className="w-full rounded-lg border border-[#E8E8E8] bg-[#FAFAF8] py-2 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-[#BBBBBA] focus:border-primary/30 focus:bg-white"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center rounded-lg border border-[#EBEBEB] p-0.5">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-[#F0F0EE] text-foreground"
                  : "text-[#BBBBBA] hover:text-foreground"
              }`}
              aria-label="Grid view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-[#F0F0EE] text-foreground"
                  : "text-[#BBBBBA] hover:text-foreground"
              }`}
              aria-label="List view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>

          <ScrapeTrigger onTrigger={onScrape} compact />
        </div>
      </div>
    </header>
  );
}
