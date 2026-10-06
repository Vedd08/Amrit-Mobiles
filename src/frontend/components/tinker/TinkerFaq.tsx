"use client";

import React, { useState } from "react";
import { Reveal } from "@/frontend/components/motion/Reveal";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Do I get a proper GST bill?",
    answer: "Always — with the IMEI printed on it, which is what warranty and insurance claims need.",
  },
  {
    question: "How long does EMI take?",
    answer: "About ten minutes on card EMI, twenty through a finance company. Bring Aadhaar, PAN and your card.",
  },
  {
    question: "Is the phone sealed?",
    answer: "Every handset is sealed brand stock. We open it in front of you and fit the screen guard free.",
  },
  {
    question: "How is my trade-in valued?",
    answer:
      "We check the phone at the counter — screen, body, battery health and whether it is boxed — and quote against it on the spot. The value comes straight off the new phone's price.",
  },
  {
    question: "How fast is delivery across Surat?",
    answer:
      "Same day to Vesu, Adajan, Ring Road, Piplod and the city centre; next day to the rest of the district. Or reserve online and collect sealed at any of the six branches.",
  },
  {
    question: "Can other shops buy from you?",
    answer: "Yes. Retailers with a GST number buy at trade price, minimum five units, delivered next day in the district.",
  },
];

export function TinkerFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 bg-white -ink">
      <div className="mx-auto max-w-6xl px-4 sm:px-10">
        <Reveal>
          <span className="mb-1.5 block text-xs font-extrabold uppercase text-lime-ink">
            Store &amp; support
          </span>
          <h2
            className="font-extrabold mb-5 sm:mb-7"
            style={{ fontSize: "clamp(26px, 3.4vw, 40px)" }}
          >
            Questions we get asked
          </h2>
        </Reveal>

        <div className="border-t-2 border-line">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <Reveal key={index} delay={index * 0.06}>
                <div className="border-b-2 border-line">
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center gap-4 py-5 sm:py-7 text-left hover:text-lime transition-colors duration-200 focus:outline-none group"
                    aria-expanded={isOpen}
                  >
                    <span className="flex-1 font-extrabold" style={{ fontSize: "clamp(16px, 2vw, 24px)" }}>
                      {faq.question}
                    </span>

                    <span
                      className={`text-lime text-2xl font-light leading-none transition-transform duration-300 group-hover:scale-110 ${
                        isOpen ? "rotate-45" : "rotate-0"
                      }`}
                    >
                      +
                    </span>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 sm:pb-7 max-w-[62ch] -ink/85 " style={{ fontSize: "clamp(14px, 1.5vw, 17px)" }}>
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
