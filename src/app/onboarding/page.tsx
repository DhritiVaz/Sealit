"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/Nav";
import {
  STACK_OPTIONS,
  DOMAIN_OPTIONS,
  GOAL_OPTIONS,
} from "@/lib/constants";
import { setOnboarding } from "@/lib/storage";
import type { BuilderGoal } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [stack, setStack] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [goal, setGoal] = useState<BuilderGoal | "">("");

  const pct = Math.round((step / 3) * 100);

  function toggleStack(item: string) {
    setStack((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  }

  function toggleDomain(item: string) {
    setDomains((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  }

  function finish() {
    if (!goal) return;
    setOnboarding({ stack, domains, goal, completed: true });
    router.push("/feed");
  }

  function next() {
    if (step < 3) setStep(step + 1);
    else finish();
  }

  return (
    <div className="animate-fade-in min-h-screen">
      <NavBar
        right={
          <span className="text-xs font-medium text-[#AAAAAA]">Step {step} of 3</span>
        }
      />
      <div className="h-0.5 overflow-hidden bg-[#EBEBEB]">
        <div
          className="h-0.5 rounded bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mx-auto max-w-[680px] px-10 pb-32 pt-16">
        {step === 1 && (
          <>
            <h1 className="mb-3 text-[44px] font-bold leading-tight tracking-tight text-foreground">
              What&apos;s your stack?
            </h1>
            <p className="mb-[52px] text-base leading-relaxed text-muted">
              Select all technologies you work with. We&apos;ll match problems you can actually build.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {STACK_OPTIONS.map((s) => {
                const on = stack.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleStack(s)}
                    className={`rounded-lg border-[1.5px] px-5 py-2.5 text-sm font-medium transition-all ${
                      on
                        ? "border-primary bg-primary font-semibold text-white shadow-sm"
                        : "border-[#E0E0DC] bg-white text-[#555550] hover:border-[#CCCCCA]"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="mb-3 text-[44px] font-bold leading-tight tracking-tight text-foreground">
              What domains do you care about?
            </h1>
            <p className="mb-[52px] text-base leading-relaxed text-muted">
              Health, climate, fintech — pick the spaces where you want to make impact.
            </p>
            <div className="flex flex-wrap gap-2">
              {DOMAIN_OPTIONS.map((d) => {
                const on = domains.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDomain(d)}
                    className={`rounded-full border px-4 py-1.5 text-[13px] font-medium transition-all ${
                      on
                        ? "border-primary bg-primary font-semibold text-white shadow-sm"
                        : "border-[#E0E0DC] bg-white text-muted hover:border-[#CCCCCA]"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="mb-3 text-[44px] font-bold leading-tight tracking-tight text-foreground">
              What&apos;s your builder goal?
            </h1>
            <p className="mb-[52px] text-base leading-relaxed text-muted">
              This helps us prioritize problems that fit your timeline.
            </p>
            <div className="flex flex-col gap-3">
              {GOAL_OPTIONS.map((g) => {
                const on = goal === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`rounded-xl border-2 px-6 py-5 text-left text-lg font-semibold transition-all ${
                      on
                        ? "border-primary bg-primary text-white shadow-sm"
                        : "border-[#E0E0DC] bg-white text-foreground hover:border-[#CCCCCA]"
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-14 flex items-center justify-between border-t border-[#F0F0EE] pt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="rounded-lg border border-[#E0E0DC] px-6 py-3 text-sm font-medium text-[#555550] transition-colors hover:border-[#999995]"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={next}
            disabled={step === 3 && !goal}
            className="rounded-lg bg-primary px-8 py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-88 disabled:opacity-40"
          >
            {step === 3 ? "Start exploring →" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
