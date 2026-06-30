"use client";

import { STORAGE_KEYS } from "./constants";

export function setAuth(value: boolean) {
  localStorage.setItem(STORAGE_KEYS.auth, value ? "true" : "false");
}
