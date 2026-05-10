"use client";

import { useEffect } from "react";
import { useFamilyStore } from "@/stores/useFamilyStore";

export default function StateBootstrap() {
  const initialize = useFamilyStore((s) => s.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return null;
}
