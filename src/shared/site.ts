/**
 * Absolute site origin, used for the `@id`/`url` fields in structured data —
 * schema.org requires absolute URLs, so a relative path is not an option.
 *
 * TODO(owner): set NEXT_PUBLIC_SITE_URL in the deployment environment. The
 * fallback below is a placeholder guess at the domain and will publish wrong
 * URLs to search engines if it ships unset.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://amritmobiles.example"
).replace(/\/$/, "");
