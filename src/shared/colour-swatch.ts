// Swatch colour for a phone's colour name, for the dots on product cards and
// the colour picker. Exact names come first (sampled from the brand photos);
// anything the admin types that isn't listed falls back to a keyword match,
// then to a neutral grey, so a new product never renders without a dot.

const NAMED: Record<string, string> = {
  // Alcatel V3
  "cosmic grey": "#2A2D36",
  "halo white": "#ECECEA",
  "matcha green": "#CFE0C6",
  "metallic grey": "#2A2E32",
  "champagne gold": "#D6C7A2",
  "hyper blue": "#1F3A9E",
  "ocean grey": "#343747",
  // Ai+ Nova 2 Neo
  black: "#25272F",
  blue: "#B4CDF2",
  red: "#B5507B",
};

const KEYWORDS: [RegExp, string][] = [
  [/black|onyx|midnight|obsidian|graphite|phantom|jet/, "#25272F"],
  [/white|pearl|frost|ivory|cloud/, "#ECECEA"],
  [/silver|titanium|steel/, "#C9CCCF"],
  [/grey|gray|ash|slate/, "#6B6F76"],
  [/gold|champagne|sand|beige|cream/, "#D6C7A2"],
  [/navy|ocean|ink/, "#27365C"],
  [/blue|sky|ice|aqua|teal/, "#5C8FD8"],
  [/green|mint|lime|olive|sage|matcha|emerald/, "#7FB08A"],
  [/purple|violet|lavender|lilac/, "#A68BD6"],
  [/pink|rose|blush|coral/, "#E7A3B6"],
  [/red|crimson|burgundy|wine|magenta/, "#B83A4B"],
  [/orange|amber|sunset/, "#E98A3C"],
  [/yellow|lemon/, "#F1D45A"],
];

export function swatchFor(colour: string): string {
  const name = colour.trim().toLowerCase();
  if (NAMED[name]) return NAMED[name];
  return KEYWORDS.find(([re]) => re.test(name))?.[1] ?? "#9A9C93";
}
