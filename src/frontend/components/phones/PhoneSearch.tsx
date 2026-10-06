"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/frontend/components/icons";
import { CloseIcon } from "./icons";

import { SUGGESTIONS } from "@/shared/search-suggestions";

/**
 * Header search. The trigger lives in the shared header; the overlay drops
 * from the top and hands the query to /phones, which does the matching.
 */
export function PhoneSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function submit(term: string) {
    const t = term.trim();
    if (!t) return;
    setOpen(false);
    setQ("");
    router.push(`/phones?q=${encodeURIComponent(t)}`);
  }


  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search phones"
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors text-ink hover:bg-paper"
      >
        <SearchIcon className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-paper/70 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search phones"
            className="absolute inset-x-0 top-0 p-4 bg-surface border-b border-line shadow-sh-1"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(q);
              }}
              className="mx-auto flex max-w-2xl items-center gap-2.5"
            >
              <SearchIcon className="h-5 w-5 shrink-0 text-ink-3" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="search"
                placeholder="Search phones, brands, models…"
                className="h-11 min-w-0 flex-1 bg-transparent text-body outline-none text-ink placeholder:text-ink-3"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close search"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink hover:bg-paper-2"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </form>
            <div className="mx-auto mt-3 flex max-w-2xl flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="rounded-full border px-3 py-1.5 text-micro font-medium transition-colors border-line text-ink hover:border-lime-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
