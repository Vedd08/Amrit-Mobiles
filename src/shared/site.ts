/**
 * Absolute site origin, used for the `@id`/`url` fields in structured data —
 * schema.org requires absolute URLs, so a relative path is not an option.
 *
 * The client's domain is amritmobiles.in (bought on Hostinger, served by
 * Vercel). NEXT_PUBLIC_SITE_URL in the deployment environment overrides it,
 * e.g. for a staging copy.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://amritmobiles.in"
).replace(/\/$/, "");
