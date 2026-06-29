"use client";

import Link from "next/link";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { ProgressBar, fmt } from "@/components/ProgressBar";
import { LiveCounter } from "@/components/LiveCounter";
import { NavBar } from "@/components/Nav";
import { SEED_PROBLEMS } from "@/lib/seed-data";

function HeroCard({ problem }: { problem: (typeof SEED_PROBLEMS)[0] }) {
  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          {problem.domain}
        </span>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>
      <h3 className="mb-2.5 text-lg font-bold leading-snug tracking-tight text-foreground">
        {problem.headline}
      </h3>
      <p className="mb-5 line-clamp-2 text-[13px] leading-relaxed text-muted">
        {problem.description}
      </p>
      <ProgressBar pct={problem.builders_started_pct} />
      <div className="mt-2">
        <span className="text-[10px] text-[#BBBBBA]">
          {fmt(problem.builders_count)} builders · {problem.builders_started_pct}% started
        </span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const cards = SEED_PROBLEMS.slice(0, 4);

  return (
    <div className="min-h-screen animate-fade-in bg-background">
      <NavBar
        right={
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#666662] transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-88"
            >
              Sign up
            </Link>
          </div>
        }
      />

      <section className="flex min-h-[calc(100vh-58px)] items-center">
        <div className="mx-auto w-full max-w-[1200px] px-14">
          <div className="flex items-center gap-16">
            <div className="min-w-0 flex-1">
              <div className="mb-7 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                Real Problems · Real Builders · Every 30 Minutes
              </div>
              <h1 className="mb-8 text-[76px] font-extrabold leading-[0.93] tracking-tight text-foreground">
                Build things
                <br />
                that need
                <br />
                to exist.
              </h1>
              <p className="mb-11 max-w-[420px] text-lg leading-relaxed text-[#666662]">
                A personalized feed of real unsolved problems — scraped from Reddit
                and HN, structured by Gemini, matched to your stack.
              </p>
              <div className="flex items-center gap-3.5">
                <Link
                  href="/login"
                  className="rounded-[10px] bg-primary px-8 py-4 text-base font-semibold text-white transition-opacity hover:opacity-88"
                >
                  Get started
                </Link>
              </div>
              <div className="mt-11 text-[13px] text-[#BBBBBA]">
                <LiveCounter />
              </div>
            </div>

            <div className="relative h-[500px] w-[480px] shrink-0 overflow-visible">
              {cards.map((p, i) => {
                const styles = [
                  "top-16 left-0 -rotate-[3.5deg] z-[4] border-[#D4D4CF] shadow-[0_12px_48px_rgba(0,0,0,0.13)]",
                  "top-[34px] left-[108px] rotate-[5.5deg] z-[3] border-[#DDDDD8]",
                  "top-[14px] left-[218px] rotate-[12deg] z-[2] border-[#E4E4E0]",
                  "top-0 left-[330px] rotate-[19deg] z-[1] border-[#E8E8E4]",
                ];
                return (
                  <div
                    key={p.id}
                    className={`absolute w-[272px] rounded-2xl border bg-white p-[22px] pointer-events-none ${styles[i]}`}
                  >
                    <HeroCard problem={p} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#EBEBEB] bg-white py-20">
        <div className="mx-auto max-w-[1200px] px-14">
          <div className="mb-13 text-[11px] font-semibold uppercase tracking-widest text-[#AAAAAA]">
            How Sealit works
          </div>
          <div className="grid grid-cols-3 gap-[72px]">
            {[
              {
                n: "01",
                title: "We scrape real gaps.",
                desc: "Every 30 minutes, we pull fresh posts from r/SomebodyMakeThis, r/startups, and Ask HN — then Gemini structures them into problem cards.",
              },
              {
                n: "02",
                title: "We match them to you.",
                desc: "Your stack, domain interests, and builder goal shape a feed of problems you could realistically build a solution for.",
              },
              {
                n: "03",
                title: "We suggest what to build.",
                desc: "Open any problem and Gemini generates 3 specific project ideas tailored to your stack — ready for this weekend.",
              },
            ].map((s) => (
              <div key={s.n}>
                <div className="mb-4 text-[13px] font-bold text-primary">{s.n}</div>
                <h3 className="mb-3.5 text-2xl font-bold tracking-tight text-foreground">{s.title}</h3>
                <p className="m-0 text-[15px] leading-relaxed text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[100px] text-center">
        <div className="mx-auto max-w-[1200px] px-14">
          <h2 className="mb-5 text-[60px] font-extrabold leading-none tracking-tight text-foreground">
            Start building what
            <br />
            needs to exist.
          </h2>
          <p className="mb-12 text-lg text-[#999995]">
            Join builders who open Sealit instead of Hacker News every morning.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-[10px] bg-primary px-9 py-4 text-[17px] font-semibold text-white transition-opacity hover:opacity-88"
          >
            Sign up
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#EBEBEB] py-7">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-14">
          <div className="flex items-center gap-5">
            <span className="logo text-[15px] font-bold tracking-tight">Sealit</span>
            <span className="text-[13px] text-[#BBBBBA]">Problems worth building. Every 30 minutes.</span>
          </div>
          <span className="text-xs text-[#CCCCCA]">© 2026 Sealit</span>
        </div>
      </footer>
    </div>
  );
}
