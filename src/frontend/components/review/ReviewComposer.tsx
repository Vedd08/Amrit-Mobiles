"use client";

import { useRef, useState } from "react";
import { REVIEW_BRANCHES, googleReviewUrl } from "@/shared/branches";
import {
  RATING_LABELS,
  REVIEW_BOUGHT,
  REVIEW_IMPROVE,
  REVIEW_LENGTHS,
  REVIEW_LIKED,
  REVIEW_TONES,
  writeReview,
  type ReviewLength,
  type ReviewTone,
} from "@/shared/review-writer";

const newSeed = () => Math.floor(Math.random() * 2 ** 31);

/**
 * /review: the shopper rates their visit, ticks what happened, and gets a
 * draft they can edit. One tap copies it and opens Google's review box for
 * their branch. Nothing is sent to us, and every rating goes to Google.
 */
export function ReviewComposer({ initialBranch }: { initialBranch: string | null }) {
  const [branch, setBranch] = useState(initialBranch);
  const [rating, setRating] = useState(0);
  const [bought, setBought] = useState<string[]>(["phone"]);
  const [liked, setLiked] = useState<string[]>([]);
  const [improve, setImprove] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [staff, setStaff] = useState("");
  const [tone, setTone] = useState<ReviewTone>("friendly");
  const [length, setLength] = useState<ReviewLength>("medium");
  const [seed, setSeed] = useState(newSeed);
  const [draft, setDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [missing, setMissing] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const store = REVIEW_BRANCHES.find((b) => b.slug === branch);
  const ready = !!store && rating > 0;

  const generate = (nextSeed: number) => {
    if (!ready) {
      setMissing(true);
      return;
    }
    setSeed(nextSeed);
    setDraft(writeReview({ rating, bought, liked, improve, phone, staff, tone, length, seed: nextSeed }));
    setCopied(false);
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const copy = () => {
    if (!draft) return;
    const done = () => setCopied(true);
    navigator.clipboard?.writeText(draft).then(done, () => {
      // Older in-app browsers: copy from the selected text box instead.
      textRef.current?.select();
      if (document.execCommand("copy")) done();
    });
  };

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(26,28,25,0.04),0_24px_48px_-24px_rgba(26,28,25,0.14)] sm:p-7">
        <Field label="Which store did you visit?" dot="bg-lime">
          <div className="grid grid-cols-2 gap-2">
            {REVIEW_BRANCHES.map((b) => (
              <button
                key={b.slug}
                type="button"
                aria-pressed={branch === b.slug}
                onClick={() => setBranch(b.slug)}
                className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  branch === b.slug ? "border-lime-ink bg-lime/15" : "border-line bg-surface hover:border-ink-4"
                }`}
              >
                <span className="block text-small leading-snug font-bold text-ink">{b.note ?? b.name}</span>
                <span className="block truncate text-[11.5px] font-medium text-ink-3">{b.area}</span>
              </button>
            ))}
          </div>
          {missing && !store && <Hint>Pick the store you visited.</Hint>}
        </Field>

        <Field label="How was your visit?" dot="bg-teal">
          <div role="radiogroup" aria-label="Star rating" className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n === 1 ? "" : "s"}, ${RATING_LABELS[n]}`}
                onClick={() => setRating(n)}
                className="grid h-12 w-11 place-items-center rounded-full transition-transform active:scale-90"
              >
                <StarIcon filled={n <= rating} className={`h-9 w-9 ${n <= rating ? "text-lime" : "text-ink-4/60"}`} />
              </button>
            ))}
            <span className="ml-2 text-small font-bold whitespace-nowrap text-ink-2" aria-live="polite">
              {rating > 0 ? RATING_LABELS[rating] : ""}
            </span>
          </div>
          {missing && rating === 0 && <Hint>Tap the stars to rate your visit.</Hint>}
        </Field>

        <Field label="What did you get?" dot="bg-lime">
          <Chips options={REVIEW_BOUGHT} selected={bought} onToggle={(v) => toggle(bought, setBought, v)} />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <TextInput value={phone} onChange={setPhone} placeholder="Which phone? e.g. Galaxy S24" label="Phone model (optional)" />
            <TextInput value={staff} onChange={setStaff} placeholder="Who helped you? e.g. Rahul" label="Staff name (optional)" />
          </div>
        </Field>

        <Field label={rating > 0 && rating <= 2 ? "Anything that went well?" : "What did you like?"} dot="bg-teal">
          <Chips options={REVIEW_LIKED} selected={liked} onToggle={(v) => toggle(liked, setLiked, v)} />
        </Field>

        {rating > 0 && rating < 5 && (
          <Field label="What could be better?" dot="bg-danger">
            <Chips options={REVIEW_IMPROVE} selected={improve} onToggle={(v) => toggle(improve, setImprove, v)} />
          </Field>
        )}

        <Field label="Tone" dot="bg-steel">
          <Segmented options={REVIEW_TONES} value={tone} onChange={(v) => setTone(v as ReviewTone)} />
        </Field>
        <Field label="Length" dot="bg-steel">
          <Segmented options={REVIEW_LENGTHS} value={length} onChange={(v) => setLength(v as ReviewLength)} />
        </Field>

        <button
          type="button"
          onClick={() => generate(newSeed())}
          className="mt-7 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-lime text-body font-bold text-ink shadow-[0_10px_24px_-12px_rgba(95,138,13,0.8)] transition-[transform,background-color] hover:bg-lime-lo active:scale-[0.98]"
        >
          <SparkIcon className="h-5 w-5" />
          {draft ? "Write it again" : "Write my review"}
        </button>
      </div>

      {draft !== null && store && (
        <div
          ref={resultRef}
          className="scroll-mt-4 rounded-[24px] border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(26,28,25,0.04),0_24px_48px_-24px_rgba(26,28,25,0.14)] motion-safe:animate-[sheetUp_320ms_cubic-bezier(0.16,1,0.3,1)] sm:p-7"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <StarIcon key={n} filled={n <= rating} className={`h-4.5 w-4.5 ${n <= rating ? "text-lime" : "text-line"}`} />
              ))}
              <span className="ml-1.5 text-xs font-bold text-ink-3">{store.note ?? store.name}</span>
            </div>
            <button
              type="button"
              onClick={() => generate(seed + 1)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-ink-2 transition-colors hover:border-ink-4 hover:text-ink"
            >
              <ShuffleIcon className="h-3.5 w-3.5" />
              Another version
            </button>
          </div>

          <label htmlFor="review-draft" className="sr-only">
            Your review
          </label>
          <textarea
            id="review-draft"
            ref={textRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setCopied(false);
            }}
            rows={7}
            className="mt-3 block min-h-40 w-full resize-y [field-sizing:content] rounded-2xl border border-line bg-paper px-4 py-3.5 text-body leading-relaxed text-ink outline-none transition-colors focus:border-lime-ink focus:bg-surface"
          />
          <p className="mt-2 text-xs text-ink-3">Edit anything that doesn&apos;t sound like you. Only post what matches your visit.</p>

          <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]">
            <a
              href={googleReviewUrl(store)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={copy}
              className="flex h-13 items-center justify-center gap-2 rounded-full bg-ink px-6 text-body font-bold text-white transition-transform hover:text-white active:scale-[0.98]"
            >
              <StarIcon filled className="h-4.5 w-4.5 text-lime" />
              Copy &amp; post on Google
            </a>
            <button
              type="button"
              onClick={copy}
              className="flex h-13 items-center justify-center gap-2 rounded-full border border-line px-6 text-small font-bold text-ink transition-colors hover:border-ink-4"
            >
              {copied ? <CheckIcon className="h-4 w-4 text-lime-ink" /> : <CopyIcon className="h-4 w-4" />}
              {copied ? "Copied" : "Copy only"}
            </button>
          </div>

          <ol className="mt-5 grid gap-2.5 rounded-2xl bg-paper p-4 text-small text-ink-2">
            <Step n={1} done={copied}>
              {copied ? "Review copied." : "We copy your review when you tap the button."}
            </Step>
            <Step n={2}>
              On Google, tap <b className="text-ink">{rating} star{rating === 1 ? "" : "s"}</b>.
            </Step>
            <Step n={3}>Long-press the text box, tap Paste, then Post.</Step>
          </ol>
        </div>
      )}
    </div>
  );
}

function Field({ label, dot, children }: { label: string; dot: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-6 min-w-0 first:mt-0">
      <legend className="mb-2.5 flex items-center gap-2 text-micro font-bold uppercase text-ink-2">
        <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs font-semibold text-danger">{children}</p>;
}

function Chips({
  options,
  selected,
  onToggle,
}: {
  options: readonly { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(o.value)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-small font-semibold transition-colors ${
              on ? "border-lime-ink bg-lime/15 text-ink" : "border-line bg-surface text-ink-2 hover:border-ink-4"
            }`}
          >
            {on && <CheckIcon className="h-3.5 w-3.5 text-lime-ink" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  // Four options sit two by two on phones, in one row from sm up.
  const cols = options.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3";
  return (
    <div className={`grid gap-1 rounded-2xl bg-paper p-1 ${cols}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-xl px-3 py-2 text-small font-semibold whitespace-nowrap transition-colors ${
            value === o.value ? "bg-surface font-bold text-ink shadow-[0_1px_3px_rgba(26,28,25,0.12)]" : "text-ink-3 hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={40}
        className="h-11 w-full rounded-xl border border-line bg-paper px-3.5 text-small font-medium text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-lime-ink focus:bg-surface"
      />
    </label>
  );
}

function Step({ n, done = false, children }: { n: number; done?: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className={`grid h-5.5 w-5.5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
          done ? "bg-lime text-ink" : "border border-line bg-surface text-ink-3"
        }`}
      >
        {done ? <CheckIcon className="h-3 w-3" /> : n}
      </span>
      <span className="pt-px">{children}</span>
    </li>
  );
}

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function StarIcon({ filled = false, className }: { filled?: boolean; className?: string }) {
  return (
    <svg aria-hidden className={className} {...svg} fill={filled ? "currentColor" : "none"} strokeWidth={1.6}>
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.9 6.8 20.6l1-5.8-4.3-4.1 5.9-.9L12 3.5z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} {...svg} strokeWidth={3}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} {...svg}>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
      <path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5" />
    </svg>
  );
}

function ShuffleIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} {...svg}>
      <path d="M16 3.5h4.5V8M4 20l16.5-16.5M20.5 16v4.5H16M14.5 14.5l6 6M4 4l5 5" />
    </svg>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} {...svg}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" />
    </svg>
  );
}
