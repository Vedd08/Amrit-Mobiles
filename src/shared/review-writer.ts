// Drafts a Google review from what the shopper picks on /review: their star
// rating, what they bought, what they liked or would change, a tone and a
// length. Plain sentence banks, no AI. The shopper edits the draft and posts
// it from their own Google account, so it only ever says what they chose:
// low ratings get honest wording and nothing is invented to fill space.

export const REVIEW_BOUGHT = [
  { value: "phone", label: "New phone" },
  { value: "exchange", label: "Exchange" },
  { value: "emi", label: "EMI / finance" },
  { value: "accessories", label: "Accessories" },
  { value: "setup", label: "Setup & data transfer" },
] as const;

export const REVIEW_LIKED = [
  { value: "staff", label: "Helpful staff" },
  { value: "price", label: "Good price" },
  { value: "genuine", label: "Genuine products" },
  { value: "quick", label: "Quick service" },
  { value: "offers", label: "Bank offers" },
  { value: "choice", label: "Wide choice" },
] as const;

export const REVIEW_IMPROVE = [
  { value: "price", label: "Pricing" },
  { value: "wait", label: "Waiting time" },
  { value: "stock", label: "Stock" },
  { value: "staff", label: "Staff attention" },
  { value: "aftersales", label: "After-sales" },
] as const;

export const REVIEW_TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "concise", label: "Concise" },
  { value: "enthusiastic", label: "Enthusiastic" },
] as const;

export const REVIEW_LENGTHS = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
] as const;

export const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"] as const;

export type ReviewTone = (typeof REVIEW_TONES)[number]["value"];
export type ReviewLength = (typeof REVIEW_LENGTHS)[number]["value"];

export type ReviewInput = {
  /** 1 to 5. */
  rating: number;
  bought: string[];
  liked: string[];
  improve: string[];
  /** Model name, e.g. "Galaxy S24"; blank for none. */
  phone: string;
  /** Who helped them; blank for none. */
  staff: string;
  tone: ReviewTone;
  length: ReviewLength;
  /** Same input and seed, same draft. "Another version" bumps it. */
  seed: number;
};

type Band = "great" | "good" | "mixed" | "poor";
type ByTone = Record<ReviewTone, string[]>;

const band = (rating: number): Band => (rating >= 5 ? "great" : rating === 4 ? "good" : rating === 3 ? "mixed" : "poor");

const OPENINGS: Record<Band, ByTone> = {
  great: {
    professional: ["Excellent experience at Amrit Mobiles.", "Very satisfied with my purchase from Amrit Mobiles."],
    friendly: ["Had a great experience at Amrit Mobiles!", "Really happy with my visit to Amrit Mobiles."],
    concise: ["Excellent store.", "Great experience."],
    enthusiastic: ["Absolutely loved shopping at Amrit Mobiles!", "What a great experience at Amrit Mobiles!"],
  },
  good: {
    professional: ["Good experience at Amrit Mobiles.", "A good, reliable mobile store."],
    friendly: ["Nice experience at Amrit Mobiles.", "Had a good time picking my phone here."],
    concise: ["Good store.", "Good experience."],
    enthusiastic: ["Really good experience at Amrit Mobiles!", "Happy with my purchase from Amrit Mobiles!"],
  },
  mixed: {
    professional: ["An average experience at Amrit Mobiles.", "A decent store, with some room to improve."],
    friendly: ["It was an okay experience at Amrit Mobiles.", "Mixed experience at Amrit Mobiles this time."],
    concise: ["Average experience.", "Okay, could be better."],
    enthusiastic: ["It was an okay experience at Amrit Mobiles.", "Mixed experience at Amrit Mobiles this time."],
  },
  poor: {
    professional: ["Disappointing experience at Amrit Mobiles.", "My visit to Amrit Mobiles did not go well."],
    friendly: ["Not a great experience at Amrit Mobiles this time.", "Sadly, my visit to Amrit Mobiles was disappointing."],
    concise: ["Disappointing experience.", "Not satisfied."],
    enthusiastic: ["Not a great experience at Amrit Mobiles this time.", "Sadly, my visit to Amrit Mobiles was disappointing."],
  },
};

const CLOSINGS: Record<Band, ByTone> = {
  great: {
    professional: ["Highly recommended for anyone buying a phone in Surat.", "I would recommend them without hesitation."],
    friendly: ["Will definitely come back for my next phone!", "Recommending them to my friends and family."],
    concise: ["Recommended.", "Highly recommended."],
    enthusiastic: ["Highly recommend, 5 stars!", "Will 100% buy my next phone here too!"],
  },
  good: {
    professional: ["Would recommend.", "Worth a visit if you are buying a phone."],
    friendly: ["Would go back again.", "Would recommend to friends."],
    concise: ["Recommended."],
    enthusiastic: ["Would definitely recommend!", "Will be back for my next phone!"],
  },
  mixed: {
    professional: ["Hope they work on these points.", "Could be much better with a few improvements."],
    friendly: ["Hope it's better next time.", "Hope they work on these points."],
    concise: ["Room to improve."],
    enthusiastic: ["Hope it's better next time.", "Hope they work on these points."],
  },
  poor: {
    professional: ["I hope the management looks into this.", "I hope they improve."],
    friendly: ["Hope they sort this out.", "I hope the management looks into this."],
    concise: [""],
    enthusiastic: ["Hope they sort this out.", "I hope the management looks into this."],
  },
};

/** What they did, in a warm and a matter-of-fact version. {phone} is "the Galaxy S24" or "a new phone". */
const BOUGHT: Record<string, { warm: string[]; plain: string[] }> = {
  phone: {
    warm: ["Bought {phone} from here.", "I recently got {phone} from this store.", "Picked up {phone} from here."],
    plain: ["I bought {phone} from here.", "I went to buy {phone}."],
  },
  exchange: {
    warm: ["Got a fair exchange value for my old phone.", "The exchange of my old phone was done on the spot at a fair price."],
    plain: ["I also exchanged my old phone."],
  },
  emi: {
    warm: ["The EMI paperwork was quick and simple.", "Took it on EMI and the process was hassle-free."],
    plain: ["I took it on EMI."],
  },
  accessories: {
    warm: ["Also got a cover and screen guard fitted right there.", "Got the accessories I needed in the same visit."],
    plain: ["I also bought accessories."],
  },
  setup: {
    warm: ["They set up the phone and moved my data from the old one.", "The team helped transfer all my data to the new phone."],
    plain: ["They helped set up the new phone."],
  },
};

const LIKED: Record<string, string[]> = {
  staff: ["The staff were helpful and patiently answered all my questions.", "The staff explained every option without any pressure to buy.", "Very helpful and polite staff."],
  price: ["Got a really good deal on the price.", "Prices are very reasonable.", "Fair and transparent pricing."],
  genuine: ["Genuine, sealed products with a proper bill and warranty.", "Everything was original, with full brand warranty."],
  quick: ["Billing was quick, with no long wait.", "The whole purchase took just a few minutes.", "Fast and smooth service."],
  offers: ["They explained the bank offers clearly, so I saved extra.", "Got good bank and card offers on top of the price."],
  choice: ["Good range of phones to compare in one place.", "Wide choice of models and colours."],
};

/** Used in place of the staff line when they named someone. */
const STAFF_NAMED = ["{staff} explained every option patiently and helped me pick the right one.", "Special thanks to {staff} for the help.", "{staff} was very helpful and polite."];

const IMPROVE: Record<string, string[]> = {
  price: ["Prices could be a little more competitive.", "The price was higher than I expected."],
  wait: ["I had to wait quite a while before someone could help.", "The waiting time was long."],
  stock: ["The model I wanted wasn't in stock.", "Stock of the variant I wanted was limited."],
  staff: ["The staff could be more attentive to customers.", "I felt the staff could have explained things better."],
  aftersales: ["After-sales support needs improvement.", "Follow-up after the purchase could be better."],
};

/** Only to reach the chosen length, and only things true of any decent visit. */
const FILLERS: Record<Band, string[]> = {
  great: ["Smooth experience from start to finish.", "The team made the whole process easy.", "Clean store and friendly people."],
  good: ["Overall a smooth purchase.", "The team was helpful."],
  mixed: ["The purchase itself went fine."],
  poor: ["The visit did not meet my expectations."],
};

const LENGTH = { short: { min: 1, max: 2 }, medium: { min: 2, max: 4 }, long: { min: 4, max: 6 } } as const;

/** Small seeded generator (mulberry32), so a draft is repeatable. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function writeReview(input: ReviewInput) {
  const rand = rng(input.seed);
  const pick = (options: readonly string[]) => options[Math.floor(rand() * options.length)];
  const shuffle = <T,>(list: T[]) => list.map((v) => [rand(), v] as const).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

  const b = band(input.rating);
  const positive = b === "great" || b === "good";
  const phone = input.phone.trim() ? `the ${input.phone.trim()}` : "a new phone";
  const staff = input.staff.trim();
  const fill = (s: string) => s.replaceAll("{phone}", phone).replaceAll("{staff}", staff);

  const facts = REVIEW_BOUGHT.filter((o) => input.bought.includes(o.value)).map((o) => {
    const bank = BOUGHT[o.value];
    return pick(positive ? bank.warm : bank.plain);
  });
  const praise = shuffle(
    input.liked.filter((v) => LIKED[v]).map((v) => pick(v === "staff" && staff ? STAFF_NAMED : LIKED[v]))
  );
  // A named helper gets thanked even if "Helpful staff" wasn't ticked, unless the visit went badly.
  if (staff && b !== "poor" && !input.liked.includes("staff")) praise.push(pick(STAFF_NAMED));
  const critique = input.rating < 5 ? shuffle(input.improve.filter((v) => IMPROVE[v]).map((v) => pick(IMPROVE[v]))) : [];

  // What matters most for this rating survives a short length.
  const { min, max } = LENGTH[input.length];
  const cap = input.tone === "concise" ? Math.min(max, 3) : max;
  const ranked = positive
    ? [...facts.slice(0, 1), ...praise, ...critique, ...facts.slice(1)]
    : [...facts.slice(0, 1), ...critique, ...praise, ...facts.slice(1)];
  const kept = new Set(ranked.slice(0, cap));

  const body = [...facts, ...praise].filter((s) => kept.has(s));
  const fillers = shuffle(FILLERS[b].filter((s) => !body.includes(s)));
  while (body.length + critique.filter((s) => kept.has(s)).length < min && fillers.length) body.push(fillers.shift()!);
  critique
    .filter((s) => kept.has(s))
    .forEach((s, i) => {
      // "However, ..." when a complaint follows praise; "Also, ..." for the next one.
      const turn = i === 0 && body.length > 0 && praise.some((p) => kept.has(p));
      const lead = turn ? "However" : i === 1 ? "Also" : null;
      const rest = /^I\b/.test(s) ? s : `${s[0].toLowerCase()}${s.slice(1)}`;
      body.push(lead ? `${lead}, ${rest}` : s);
    });

  const opening = pick(OPENINGS[b][input.tone]);
  const closing = input.length === "short" && input.tone === "concise" ? "" : pick(CLOSINGS[b][input.tone]);
  return [opening, ...body.map(fill), closing].filter(Boolean).join(" ");
}
