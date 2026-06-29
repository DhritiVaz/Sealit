"use client";

import { useCallback, useEffect, useState } from "react";
import { getBuildingProblems, getSavedProblems } from "./storage";

export function useNavCounts() {
  const [savedCount, setSavedCount] = useState(0);
  const [buildingCount, setBuildingCount] = useState(0);

  const refresh = useCallback(() => {
    setSavedCount(getSavedProblems().length);
    setBuildingCount(getBuildingProblems().length);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { savedCount, buildingCount, refresh };
}
