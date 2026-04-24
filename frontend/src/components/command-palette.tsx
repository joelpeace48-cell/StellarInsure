"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ShortcutItem = {
  id: string;
  label: string;
  description: string;
  action: () => void;
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const timer = window.setTimeout(() => setStatus("ready"), 220);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = useMemo<ShortcutItem[]>(
    () => [
      { id: "overview", label: "Go to Overview", description: "Dashboard summary", action: () => router.push("/") },
      { id: "create", label: "Create Policy", description: "Open policy form", action: () => router.push("/create") },
      { id: "policies", label: "Open Policies", description: "View policy portfolio", action: () => router.push("/policies") },
      { id: "history", label: "Open History", description: "Inspect transactions", action: () => router.push("/history") },
      { id: "settings", label: "Open Preferences", description: "Account preferences form", action: () => router.push("/settings") },
    ],
    [router],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) =>
      `${item.label} ${item.description}`.toLowerCase().includes(normalized),
    );
  }, [items, query]);

  return (
    <>
      <button className="cta-secondary" type="button" onClick={() => setOpen(true)} aria-label="Open command palette">
        Quick Nav
      </button>
      {open ? (
        <div className="cp-backdrop" role="dialog" aria-modal="true" aria-label="Command palette">
          <div className="cp-panel">
            <input
              className="field__input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search routes and actions..."
              autoFocus
            />
            {status === "loading" ? <p className="form-status">Loading quick actions...</p> : null}
            {status === "error" ? (
              <p className="form-status">Unable to load actions right now. Try again.</p>
            ) : null}
            {status === "ready" && filtered.length === 0 ? (
              <p className="form-status">No matching actions found.</p>
            ) : null}
            {status === "ready" && filtered.length > 0 ? (
              <ul className="cp-list">
                {filtered.map((item) => (
                  <li key={item.id}>
                    <button
                      className="cp-item"
                      type="button"
                      onClick={() => {
                        item.action();
                        setOpen(false);
                      }}
                    >
                      <strong>{item.label}</strong>
                      <span>{item.description}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
