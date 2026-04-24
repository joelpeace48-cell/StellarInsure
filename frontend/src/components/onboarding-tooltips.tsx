"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const KEY = "stellarinsure-context-tooltips";

const TIPS: Record<string, string[]> = {
  "/": [
    "Use Quick Nav (Ctrl/Cmd+K) to jump between pages.",
    "Start from Create Policy to complete your first coverage setup.",
  ],
  "/create": [
    "Set coverage first, then configure trigger rules.",
    "Review oracle source confidence before signing.",
  ],
};

export function OnboardingTooltips() {
  const pathname = usePathname() ?? "/";
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(true);
  const tips = TIPS[pathname] ?? [];

  useEffect(() => {
    const seen = typeof window !== "undefined" ? localStorage.getItem(KEY) : "true";
    setHidden(Boolean(seen) || tips.length === 0);
    setIndex(0);
  }, [pathname, tips.length]);

  if (hidden || tips.length === 0) return null;

  return (
    <aside className="onboarding-tip" role="status" aria-live="polite">
      <p>{tips[index]}</p>
      <div className="inline-actions">
        <button className="cta-secondary" type="button" onClick={() => setIndex((i) => (i + 1) % tips.length)}>
          Next tip
        </button>
        <button
          className="cta-secondary"
          type="button"
          onClick={() => {
            localStorage.setItem(KEY, "true");
            setHidden(true);
          }}
        >
          Dismiss
        </button>
      </div>
    </aside>
  );
}
