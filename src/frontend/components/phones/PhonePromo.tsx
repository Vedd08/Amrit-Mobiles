import { Reveal } from "@/frontend/components/motion/Reveal";
import { buildWhatsAppLink, SHOP_WHATSAPP_NUMBER } from "@/shared/whatsapp";

/**
 * One promotional band, adapted from the reference's "summer sale" strip.
 * The offer that actually matters to this shop is exchange — and the CTA is a
 * real WhatsApp thread, which is how valuations happen here.
 */
export function PhonePromo() {
  const wa = buildWhatsAppLink(
    SHOP_WHATSAPP_NUMBER,
    "Hi Amrit Mobiles, I'd like to exchange my old phone. What is it worth against a new one?",
  );

  return (
    <section className="w-full py-16 md:py-24 my-16 border-y border-line bg-lime">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-micro font-bold tracking-widest text-[#2A2A2A] uppercase mb-4">Exchange</p>
            <h2 className="mb-6 text-3xl md:text-5xl font-extrabold tracking-tighter text-[#2A2A2A]">
              Trade in your old phone
            </h2>
            <p className="mb-10 text-body md:text-body-lg leading-relaxed text-[#2A2A2A]/80">
              Bring it to any Surat branch, or send photos on WhatsApp for a quick valuation. The
              exchange amount comes straight off your new phone.
            </p>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-[#2A2A2A] px-8 py-4 text-small font-bold uppercase tracking-wider text-lime transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2A2A2A]"
            >
              Get an exchange quote
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
