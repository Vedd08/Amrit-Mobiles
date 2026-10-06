import {
  BRANCHES,
  BRANCH_HOURS,
  CITY,
  COUNTRY,
  REGION,
} from "@/shared/branches";
import { SHOP_WHATSAPP_NUMBER } from "@/shared/whatsapp";

/**
 * LocalBusiness structured data for the six Surat branches.
 *
 * For a multi-branch local retailer this is the single highest-leverage SEO
 * surface there is — it decides whether the shops surface for "mobile shop
 * near me" — and the site previously emitted none at all.
 *
 * Shape: one parent `MobilePhoneStore` for the brand, with each branch as its
 * own `MobilePhoneStore` in `subOrganization`. Rendered as a plain <script>
 * rather than next/script, per the framework guide: JSON-LD is data, not
 * executable code.
 *
 * Fields the owner still has to confirm are listed in src/shared/branches.ts —
 * notably street addresses and per-branch phone numbers. Nothing here is
 * invented beyond the hours constant; branches with no confirmed street simply
 * omit `streetAddress` rather than carry a fabricated one.
 */
export function LocalBusinessJsonLd({ siteUrl }: { siteUrl: string }) {
  const telephone = `+${SHOP_WHATSAPP_NUMBER}`;

  const openingHoursSpecification = [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: BRANCH_HOURS.opens,
      closes: BRANCH_HOURS.closes,
    },
  ];

  const branch = (b: (typeof BRANCHES)[number]) => ({
    "@type": "MobilePhoneStore",
    "@id": `${siteUrl}/#branch-${b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: `Amrit Mobiles — ${b.name}`,
    description: `Authorised mobile phone dealer in ${b.area}, ${CITY}. Sealed stock, GST billing with the IMEI printed on the bill, and 0% EMI approved at the counter.`,
    address: {
      "@type": "PostalAddress",
      ...(b.street ? { streetAddress: b.street } : {}),
      addressLocality: b.area,
      addressRegion: REGION,
      addressCountry: COUNTRY,
      ...(b.postalCode ? { postalCode: b.postalCode } : {}),
    },
    telephone,
    hasMap: b.maps,
    url: `${siteUrl}/#stores`,
    parentOrganization: { "@id": `${siteUrl}/#organization` },
    openingHoursSpecification,
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Credit Card, Debit Card, EMI",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MobilePhoneStore",
        "@id": `${siteUrl}/#organization`,
        name: "Amrit Mobiles & Electronics",
        description:
          "Authorised mobile phone dealer with six branches across Surat. Every box opened at the counter, IMEI printed on your GST bill, 0% EMI approved in about ten minutes.",
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        image: `${siteUrl}/logo.png`,
        telephone,
        areaServed: { "@type": "City", name: CITY },
        address: {
          "@type": "PostalAddress",
          addressLocality: CITY,
          addressRegion: REGION,
          addressCountry: COUNTRY,
        },
        openingHoursSpecification,
        currenciesAccepted: "INR",
        paymentAccepted: "Cash, UPI, Credit Card, Debit Card, EMI",
        subOrganization: BRANCHES.map(branch),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Amrit Mobiles & Electronics",
        publisher: { "@id": `${siteUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/phones?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Escaping `<` is the documented guard against XSS via JSON.stringify.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
