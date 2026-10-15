// The Surat branches — single source of truth.
//
// Shared because the store lists, the homepage's LocalBusiness JSON-LD and the
// "chat with your nearest store" WhatsApp routing all read from here. A store
// list that disagrees with its own structured data is worse than none.
//
// Names, addresses and numbers are the owner's (shared 2026-10-14). Map pins
// are each shop's own Google Maps listing, except the two marked
// `approximateLocation`, which have no listing of their own and are placed
// from their street address (close enough to pick the nearest store).
//
// ---------------------------------------------------------------------------
// TODO(owner): still to confirm before this is treated as complete:
//   * Udhna's number: it was given as "798413301", which is one digit short,
//     so that branch has no WhatsApp/call button until it is corrected.
//   * BRANCH_HOURS — assumed Mon–Sun 10:00–21:00.
// ---------------------------------------------------------------------------

export type Branch = {
  /** Stable id (used for the remembered "your store" choice). */
  slug: string;
  /** Name the branch is known by. */
  name: string;
  /** Short locality shown under the name. */
  area: string;
  /** Street address, as the owner gave it (without city / state / PIN). */
  address: string;
  postalCode: string;
  /** WhatsApp / phone number, digits only with country code; null if unknown. */
  phone: string | null;
  /** Shop position, used to find the store nearest the visitor. */
  lat: number;
  lng: number;
  /** True when the pin comes from the street address, not the shop's own listing. */
  approximateLocation?: boolean;
  /** Google Maps link for directions. */
  maps: string;
  /** Extra label, e.g. a branded store. */
  note?: string;
};

const mapsSearch = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const BRANCHES: Branch[] = [
  {
    slug: "pal",
    name: "Pal",
    area: "Pal Gam, Adajan",
    address: "Ground floor, Swarnim Lifestyle, Gaurav Path Road, nr. Shreepad Seasons, Pal Gam",
    postalCode: "395009",
    phone: "919825298923",
    lat: 21.2094676,
    lng: 72.7673311,
    maps: "https://maps.app.goo.gl/wH9WuGsDk81DbyQK9",
  },
  {
    slug: "vesu",
    name: "Vesu",
    area: "VIP Road, Vesu",
    address: "G8, The Grand Plaza, VIP Rd, Vesu",
    postalCode: "395007",
    phone: "919875167001",
    lat: 21.1411469,
    lng: 72.7824065,
    maps: "https://maps.app.goo.gl/EwLsUuK9YWyEpn7r7?g_st=ac",
  },
  {
    slug: "udhna",
    name: "Udhna",
    area: "Udhana Darwaja",
    address: "Vijay House, 2/627, Cross Road, Udhana Darwaja, Rustampura",
    postalCode: "395002",
    // TODO(owner): given as "798413301" (9 digits) — needs the full number.
    phone: null,
    lat: 21.1832,
    lng: 72.832,
    approximateLocation: true,
    maps: mapsSearch("Vijay House, 2/627, Cross Road, Udhana Darwaja, Rustampura, Surat 395002"),
  },
  {
    slug: "ring-road-1",
    name: "Ring Road (Branch 1)",
    area: "New Textile Market",
    address: "Shop No. 8, 9, Tower Elbee App, 10.A, Ring Rd, Maan Darwaja, New Textile Market",
    postalCode: "395002",
    phone: "917863027800",
    lat: 21.1850019,
    lng: 72.8357174,
    maps: "https://maps.app.goo.gl/TW5DRZuMPp3dQFH66",
  },
  {
    slug: "ring-road-2",
    name: "Ring Road (Branch 2)",
    area: "New Textile Market",
    address: "Shop No. 25, Ajanta Shopping Centre, Ring Rd, Maan Darwaja, New Textile Market",
    postalCode: "395002",
    phone: "917863027800",
    lat: 21.1847,
    lng: 72.8352,
    approximateLocation: true,
    maps: mapsSearch("Ajanta Shopping Centre, Ring Road, Maan Darwaja, Surat 395002"),
  },
  {
    slug: "limbayat",
    name: "Limbayat",
    area: "Maruti Nagar, Limbayat",
    address: "Ground Floor, Police Station, B-13, opposite Limbayat, Rustam Park, Maruti Nagar, Limbayat",
    postalCode: "395012",
    phone: "919510959424",
    lat: 21.1756862,
    lng: 72.8568475,
    maps: "https://maps.app.goo.gl/Kffv6uCBtatX8hcp9?g_st=ac",
  },
  {
    slug: "mahaprabhu-nagar",
    name: "Mahaprabhu Nagar",
    area: "Parvat Gam, Limbayat",
    address: "Shop 1, 2, Ground floor, Plot no 47, 3, nr. Krishna cinema, Mahaprabhu Nagar, Parvat Gam, Limbayat",
    postalCode: "395012",
    phone: "919274034929",
    lat: 21.1770707,
    lng: 72.8616666,
    maps: "https://maps.app.goo.gl/xNhXBZa9dcBroJEd8?g_st=ac",
  },
  {
    slug: "godadara",
    name: "Godadara",
    area: "Kuber Nagar, Godadara",
    address: "Ground floor, 42, nr. Nilgiri Road, Kuber Nagar, Godadara",
    postalCode: "395010",
    phone: "919274042348",
    lat: 21.1674754,
    lng: 72.8702929,
    maps: "https://maps.app.goo.gl/VNSLRgom4nUdbaZc9?g_st=ac",
  },
  {
    slug: "pandol-ved-road",
    name: "Pandol, Ved Road",
    area: "Ved Road, Singanpor",
    address: "Pandol Ind Co Op Ser Soc, 56, Ved Rd, opp. Ramji Nagar, Fatakdawadi, Industrial Area, Singanpor",
    postalCode: "395004",
    phone: "917778887992",
    lat: 21.2146914,
    lng: 72.8222315,
    maps: mapsSearch("Amrit Moblies Samsung Cafe, Ved Road, Surat"),
    note: "Samsung Café",
  },
];

/** Branches a visitor can message on WhatsApp. */
export const CHAT_BRANCHES = BRANCHES.filter((b): b is Branch & { phone: string } => b.phone !== null);

/** Used when nothing better is known (no JS, no location, nothing chosen): the city-centre store. */
export const DEFAULT_BRANCH = BRANCHES.find((b) => b.slug === "ring-road-1")!;

/** Full one-line postal address. */
export function branchAddress(b: Branch) {
  return `${b.address}, ${CITY}, ${REGION} ${b.postalCode}`;
}

/** Straight-line distance in km (haversine). */
export function distanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(to.lat - from.lat);
  const dLng = rad(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(from.lat)) * Math.cos(rad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Assumed until the owner confirms. Mirrored in the copy shown to visitors. */
export const BRANCH_HOURS = { opens: "10:00", closes: "21:00", days: "Mon–Sun" };

export const CITY = "Surat";
export const REGION = "Gujarat";
export const COUNTRY = "IN";
