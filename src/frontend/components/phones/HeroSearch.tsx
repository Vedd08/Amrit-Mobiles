"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/frontend/components/icons";
import { SUGGESTIONS } from "@/shared/search-suggestions";
import { useReducedMotion } from "@/frontend/lib/use-reduced-motion";

export function HeroSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const [placeholder, setPlaceholder] = useState("Search phones, brands, models…");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const stopTypingRef = useRef(false);

  useEffect(() => {
    if (reducedMotion || initialQuery) return;
    
    let timeoutId: ReturnType<typeof setTimeout>;
    let isDeleting = false;
    let loopNum = 0;
    let text = "";
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const delayBeforeDelete = 2000;
    const initialDelay = 1500;
    
    const queries = ["iPhone 15 Pro", "Samsung Galaxy S24", "Phones under ₹25,000", "OnePlus 12"];
    
    const tick = () => {
      if (stopTypingRef.current) return;
      
      const i = loopNum % queries.length;
      const fullText = queries[i];
      
      if (isDeleting) {
        text = fullText.substring(0, text.length - 1);
      } else {
        text = fullText.substring(0, text.length + 1);
      }
      
      setPlaceholder(text);
      
      let delta = isDeleting ? deletingSpeed : typingSpeed;
      
      if (!isDeleting && text === fullText) {
        delta = delayBeforeDelete;
        isDeleting = true;
      } else if (isDeleting && text === "") {
        isDeleting = false;
        loopNum++;
        delta = 500;
        setPlaceholder("Search phones, brands, models…");
      }
      
      timeoutId = setTimeout(tick, delta);
    };
    
    timeoutId = setTimeout(tick, initialDelay);
    
    return () => clearTimeout(timeoutId);
  }, [reducedMotion, initialQuery]);

  const shownPlaceholder = isFocused || q ? "Search phones, brands, models…" : placeholder;

  function submit(e?: React.FormEvent, term?: string) {
    if (e) e.preventDefault();
    const t = (term ?? q).trim();
    if (!t) return;
    router.push(`/phones?q=${encodeURIComponent(t)}`);
  }

  return (
    <div className="w-full max-w-xl">
      <form
        onSubmit={submit}
        className={`relative flex items-center w-full rounded-full bg-surface shadow-sh-1 border border-line p-1.5 focus-within:border-lime-ink transition-all ${
          isFocused ? 'shadow-[0_0_15px_rgba(146,195,24,0.4)] border-lime' : ''
        }`}
      >
        <label htmlFor="hero-search" className="sr-only">Search phones</label>
        <div className="pl-4 pr-2 text-ink-3">
          <SearchIcon className="h-5 w-5" />
        </div>
        <input
          id="hero-search"
          type="search"
          value={q}
          onChange={(e) => {
            stopTypingRef.current = true;
            setQ(e.target.value);
          }}
          onFocus={() => {
            stopTypingRef.current = true;
            setIsFocused(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={shownPlaceholder}
          className="h-12 min-w-0 flex-1 bg-transparent text-body font-medium outline-none text-ink placeholder:text-ink-4"
        />
        <button
          type="submit"
          aria-label="Search"
          className="ml-2 flex h-12 items-center justify-center rounded-full bg-lime px-6 font-bold text-[#2A2A2A] transition-colors hover:bg-lime-lo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
        >
          Search
        </button>
      </form>
      
      {!initialQuery && (
        <div className="mt-4 hidden flex-wrap items-center justify-center gap-2 sm:flex lg:justify-start">
          <span className="text-micro font-bold tracking-widest text-ink-3 uppercase mr-1">Popular:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => submit(undefined, s)}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-micro font-medium text-ink transition-colors hover:border-lime-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
