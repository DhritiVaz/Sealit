"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SIDEBAR_CATEGORIES } from "@/lib/constants";
import { Logo } from "./Nav";
import { SidebarProvider, SidebarToggle, useSidebar } from "./SidebarContext";

const feedIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const buildIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const saveIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const profileIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const categoryIcons: Record<string, React.ReactNode> = {
  heart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  code: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  leaf: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    </svg>
  ),
  dollar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  book: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

function AppShellInner({
  children,
  savedCount = 0,
  buildingCount = 0,
}: {
  children: React.ReactNode;
  savedCount?: number;
  buildingCount?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { open, close, selectedCategory, setSelectedCategory } = useSidebar();

  const navItem = (
    href: string,
    label: string,
    icon: React.ReactNode,
    active: boolean,
    badge?: number
  ) => (
    <Link
      href={href}
      title={!open ? label : undefined}
      aria-label={label}
      onClick={() => {
        if (window.innerWidth < 768 && open) close();
      }}
      className={`relative flex items-center rounded-lg transition-colors ${
        open ? "gap-3 px-3 py-2.5 text-sm" : "justify-center p-2.5"
      } ${
        active
          ? "bg-[#F0F0EE] font-semibold text-foreground"
          : "font-medium text-[#666662] hover:bg-[#F7F7F5] hover:text-foreground"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      {open ? <span>{label}</span> : null}
      {open && badge && badge > 0 ? (
        <span className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
      {!open && badge && badge > 0 ? (
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
      ) : null}
    </Link>
  );

  function handleCategoryChange(catId: string) {
    const next = selectedCategory === catId ? null : catId;
    setSelectedCategory(next);
    if (pathname !== "/feed") {
      router.push("/feed");
    }
  }

  function clearCategory() {
    setSelectedCategory(null);
    if (pathname !== "/feed") {
      router.push("/feed");
    }
  }

  const feedActive =
    pathname === "/feed" ||
    (pathname.startsWith("/problem") && !pathname.startsWith("/building"));

  return (
    <div className="flex h-screen overflow-hidden animate-fade-in bg-background">
      {open && (
        <button
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={close}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-[#EBEBEB] bg-white transition-[width] duration-200 ease-in-out md:relative ${
          open ? "w-[220px]" : "w-[56px]"
        }`}
      >
        <div
          className={`flex items-center border-b border-[#F4F4F2] py-3.5 ${
            open ? "gap-2 px-3" : "justify-center px-2"
          }`}
        >
          <SidebarToggle />
          {open ? <Logo className="text-[17px]" /> : null}
        </div>

        <nav className={`flex flex-col gap-0.5 ${open ? "p-3" : "px-2 py-3"}`}>
          {navItem("/feed", "Feed", feedIcon, feedActive)}
          {navItem("/building", "Building", buildIcon, pathname.startsWith("/building"), buildingCount || undefined)}
          {navItem("/saved", "Saved", saveIcon, pathname === "/saved", savedCount || undefined)}
          {navItem("/profile", "Profile", profileIcon, pathname === "/profile")}
        </nav>

        <div className={`mt-2 flex-1 overflow-y-auto pb-3 ${open ? "px-3" : "px-2"}`}>
          {open ? (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#BBBBBA]">
              Categories
            </p>
          ) : (
            <div className="mb-2 flex justify-center">
              <span className="h-px w-6 bg-[#EBEBEB]" />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            {SIDEBAR_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                title={!open ? cat.label : undefined}
                aria-label={cat.label}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center rounded-lg transition-colors ${
                  open ? "gap-3 px-3 py-2 text-[13px]" : "justify-center p-2.5"
                } ${
                  selectedCategory === cat.id
                    ? "bg-primary-light font-semibold text-primary"
                    : "font-medium text-[#666662] hover:bg-[#F7F7F5]"
                }`}
              >
                <span className="text-[#888884]">{categoryIcons[cat.icon]}</span>
                {open ? cat.label : null}
              </button>
            ))}
            {open ? (
              <button
                type="button"
                onClick={clearCategory}
                className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-[#888884] hover:text-primary"
              >
                View all
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                title="View all categories"
                aria-label="View all categories"
                onClick={clearCategory}
                className="flex justify-center rounded-lg p-2.5 text-[#888884] transition-colors hover:bg-[#F7F7F5] hover:text-primary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export function AppShell(props: {
  children: React.ReactNode;
  savedCount?: number;
  buildingCount?: number;
}) {
  return (
    <SidebarProvider>
      <AppShellInner {...props} />
    </SidebarProvider>
  );
}

export { SidebarToggle };
