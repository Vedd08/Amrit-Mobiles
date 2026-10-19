// The "Our journey" story in the About section: the two generations who run
// Amrit Mobiles, and the milestones from the first counter to today.
//
// ---------------------------------------------------------------------------
// TODO(owner): everything below is written from what we know for sure. Before
// launch, fill in what only the family can confirm:
//   * names: the founder (Vicky Bhai's father) and Vicky Bhai's full name
//   * `year` on each milestone: the year Amrit Mobiles started, when Vicky Bhai
//     joined, when the branches and the Samsung Café opened
//   * anything worth adding: awards, brand partnerships, a first-shop photo
// A milestone or person without a year/name simply shows without one, so
// nothing invented ever appears on the site.
// ---------------------------------------------------------------------------

import { BRANCHES } from "./branches";

export type JourneyPerson = {
  /** Shown as the caption; the role is shown instead while this is empty. */
  name: string;
  role: string;
  photo: { src: string; width: number; height: number; alt: string };
  /** One line under the name. */
  line: string;
};

export const JOURNEY_PEOPLE: JourneyPerson[] = [
  {
    name: "", // TODO(owner): founder's name
    role: "Where it began",
    photo: {
      src: "/images/about/journey-founder.webp",
      width: 738,
      height: 984,
      alt: "Portrait of the founder of Amrit Mobiles, Vicky Bhai's father",
    },
    line: "Started Amrit Mobiles in Surat and built it on trust, one customer at a time.",
  },
  {
    name: "", // TODO(owner): Vicky Bhai's full name
    role: "Leading it today",
    photo: {
      src: "/images/about/journey-leader.webp",
      width: 900,
      height: 1200,
      alt: "Portrait of Vicky Bhai, who leads Amrit Mobiles today",
    },
    line: "His son, now running the family business and taking it across Surat and online.",
  },
];

export type Milestone = {
  /** e.g. "1998". Leave empty until the owner confirms it. */
  year: string;
  title: string;
  body: string;
};

const samsungCafe = BRANCHES.find((b) => b.note === "Samsung Café");

export const MILESTONES: Milestone[] = [
  {
    year: "", // TODO(owner): founding year
    title: "The first counter",
    body: "Amrit Mobiles opens in Surat as a family-run phone shop, built on one rule: the customer should know exactly what they are buying.",
  },
  {
    year: "", // TODO(owner)
    title: "The next generation",
    body: "Vicky Bhai joins his father in the business, and the family shop starts growing beyond its first counter.",
  },
  {
    year: "", // TODO(owner)
    title: `${BRANCHES.length} branches across the city`,
    body: "From Pal on the far bank of the Tapi to Godadara in the east, every Amrit counter works the same way: sealed box opened in front of you, IMEI on your GST bill.",
  },
  ...(samsungCafe
    ? [
        {
          year: "", // TODO(owner)
          title: "A Samsung Café on Ved Road",
          body: `A branded Samsung store at ${samsungCafe.name}, alongside every major brand at the other branches.`,
        },
      ]
    : []),
  {
    year: "2026",
    title: "Amrit Mobiles online",
    body: "Browse every phone on the website, then order straight to your nearest branch on WhatsApp.",
  },
];
