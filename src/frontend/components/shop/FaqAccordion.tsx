"use client";

import { useState } from "react";

type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-border">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className={`flex w-full items-center justify-between gap-4 py-4 text-left transition-colors ${
                open ? "rounded-lg bg-paper px-4" : "px-0"
              }`}
            >
              <span className="font-semibold">{item.question}</span>
              <span
                className="relative h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200"
                style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
              >
                <span className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-current" />
                <span className="absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 bg-current" />
              </span>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className={`text-sm leading-relaxed text-ink-3 ${open ? "rounded-b-xl bg-paper px-4 pb-4" : "px-0"}`}>
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
