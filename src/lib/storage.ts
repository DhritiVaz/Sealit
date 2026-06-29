"use client";

import type { BuildingProblem, OnboardingProfile, SavedProblem } from "./types";
import { STORAGE_KEYS } from "./constants";

export function getAuth(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.auth) === "true";
}

export function setAuth(value: boolean) {
  localStorage.setItem(STORAGE_KEYS.auth, value ? "true" : "false");
}

export function getOnboarding(): OnboardingProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEYS.onboarding);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingProfile;
  } catch {
    return null;
  }
}

export function setOnboarding(profile: OnboardingProfile) {
  localStorage.setItem(STORAGE_KEYS.onboarding, JSON.stringify(profile));
}

export function getSavedProblems(): SavedProblem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.saved);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedProblem[];
  } catch {
    return [];
  }
}

export function saveProblem(id: string) {
  const saved = getSavedProblems();
  if (saved.some((s) => s.id === id)) return;
  saved.unshift({ id, savedAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(saved));
}

export function unsaveProblem(id: string) {
  const saved = getSavedProblems().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(saved));
}

export function isProblemSaved(id: string): boolean {
  return getSavedProblems().some((s) => s.id === id);
}

export function getBuildingProblems(): BuildingProblem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.building);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as BuildingProblem[];
  } catch {
    return [];
  }
}

export function startBuilding(id: string) {
  const building = getBuildingProblems();
  if (building.some((b) => b.id === id)) return;
  building.unshift({ id, startedAt: new Date().toISOString(), stage: "idea" });
  localStorage.setItem(STORAGE_KEYS.building, JSON.stringify(building));
}

export function stopBuilding(id: string) {
  const building = getBuildingProblems().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEYS.building, JSON.stringify(building));
}

export function isBuilding(id: string): boolean {
  return getBuildingProblems().some((b) => b.id === id);
}

export function getBuildingProblem(id: string): BuildingProblem | undefined {
  return getBuildingProblems().find((b) => b.id === id);
}

export function updateBuildingStage(id: string, stage: import("./types").BuildStage) {
  const building = getBuildingProblems().map((b) =>
    b.id === id ? { ...b, stage } : b
  );
  localStorage.setItem(STORAGE_KEYS.building, JSON.stringify(building));
}
