"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("sealit_sidebar_open");
    if (stored !== null) setOpen(stored === "true");
  }, []);

  function persist(value: boolean) {
    localStorage.setItem("sealit_sidebar_open", String(value));
  }

  function toggle() {
    setOpen((o) => {
      persist(!o);
      return !o;
    });
  }

  function close() {
    setOpen(false);
    persist(false);
  }

  return (
    <SidebarContext.Provider
      value={{ open, toggle, close, selectedCategory, setSelectedCategory }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

export function SidebarToggle({ className = "" }: { className?: string }) {
  const { toggle, open } = useSidebar();

  return (
    <button
      onClick={toggle}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#666662] transition-colors hover:bg-[#F0F0EE] hover:text-foreground ${className}`}
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  );
}
