// The six Surat branches — single source of truth.
//
// Previously these lived inline in StoreLocator.tsx. They are shared now
// because the homepage also emits LocalBusiness JSON-LD for each branch, and
// a store list that disagrees with its own structured data is worse than no
// structured data at all.
//
// The `maps` links are the real Google Maps short links for each shop.
//
// ---------------------------------------------------------------------------
// TODO(owner): three fields below are still placeholders and must be confirmed
// before this is treated as live business data, because they are published to
// search engines verbatim:
//   * `street`      — currently null; Google wants a real streetAddress
//   * `postalCode`  — currently null
//   * `phone`       — every branch shares SHOP_TEL_LINK's placeholder number
//   * BRANCH_HOURS  — assumed Mon–Sun 10:00–21:00
// Everything else (names, areas, map links, city) is real.
// ---------------------------------------------------------------------------

export type Branch = {
  /** Locality the shop is known by — used as the branch name. */
  name: string;
  /** Human-readable position within the city. */
  area: string;
  /** Real Google Maps short link. */
  maps: string;
  street: string | null;
  postalCode: string | null;
};

export const BRANCHES: Branch[] = [
  {
    name: "Mahaprabhu Nagar",
    area: "Central Surat",
    maps: "https://maps.app.goo.gl/xNhXBZa9dcBroJEd8?g_st=ac",
    street: null,
    postalCode: null,
  },
  {
    name: "Godadara",
    area: "South-East Surat",
    maps: "https://maps.app.goo.gl/VNSLRgom4nUdbaZc9?g_st=ac",
    street: null,
    postalCode: null,
  },
  {
    name: "Limbayat",
    area: "East Surat",
    maps: "https://maps.app.goo.gl/Kffv6uCBtatX8hcp9?g_st=ac",
    street: null,
    postalCode: null,
  },
  {
    name: "Ring Road",
    area: "City centre",
    maps: "https://maps.app.goo.gl/TW5DRZuMPp3dQFH66",
    street: null,
    postalCode: null,
  },
  {
    name: "Vesu",
    area: "West Surat",
    maps: "https://maps.app.goo.gl/EwLsUuK9YWyEpn7r7?g_st=ac",
    street: null,
    postalCode: null,
  },
  {
    name: "PAL",
    area: "Adajan / PAL",
    maps: "https://maps.app.goo.gl/wH9WuGsDk81DbyQK9",
    street: null,
    postalCode: null,
  },
];

/** Assumed until the owner confirms. Mirrored in the copy shown to visitors. */
export const BRANCH_HOURS = { opens: "10:00", closes: "21:00", days: "Mon–Sun" };

export const CITY = "Surat";
export const REGION = "Gujarat";
export const COUNTRY = "IN";
