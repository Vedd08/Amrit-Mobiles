"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/frontend/lib/motion";

gsap.registerPlugin(ScrollTrigger);

interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  category: string;
  aspectRatio: string;
  image: string;
  badge?: string;
  link: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "1",
    title: "Pro Cinematic Video",
    description: "4K HDR Dolby Vision recording with spatial audio capture.",
    category: "Camera",
    aspectRatio: "aspect-[345/484]",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    badge: "4K HDR",
    link: "/category/phones",
  },
  {
    id: "2",
    title: "Quantum Battery",
    description: "0 to 80% charge in just 18 minutes with smart heat control.",
    category: "Power",
    aspectRatio: "aspect-[115/142]",
    image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=800&q=80",
    badge: "120W Fast",
    link: "/category/phones",
  },
  {
    id: "3",
    title: "OLED Curved Display",
    description: "120Hz ProMotion fluid touch, 2600 nits peak brightness.",
    category: "Display",
    aspectRatio: "aspect-[344/495]",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80",
    badge: "120Hz OLED",
    link: "/category/phones",
  },
  {
    id: "4",
    title: "Instant Trade-In",
    description: "Exchange your old phone in 60 seconds with instant appraisal.",
    category: "Value",
    aspectRatio: "aspect-[115/89]",
    image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80",
    badge: "Best Value",
    link: "/category/phones",
  },
  {
    id: "5",
    title: "Snapdragon & Bionic AI",
    description: "3nm architecture for console-grade gaming and zero lag.",
    category: "Performance",
    aspectRatio: "aspect-[344/639]",
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80",
    badge: "3nm Chip",
    link: "/category/phones",
  },
  {
    id: "6",
    title: "Smartphone Ecosystem",
    description: "High-speed wireless connectivity and pro-tier mobile integration.",
    category: "Phones",
    aspectRatio: "aspect-[115/149]",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
    badge: "Flagships",
    link: "/phones",
  },
  {
    id: "7",
    title: "Nightography Mode",
    description: "Ultra-crisp low-light portraits without noise.",
    category: "Camera",
    aspectRatio: "aspect-[345/547]",
    image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=800&q=80",
    badge: "Night Vision",
    link: "/category/phones",
  },
  {
    id: "8",
    title: "5G Ultra Wideband",
    description: "Gigabit speeds for zero-buffer 8K streaming everywhere.",
    category: "Network",
    aspectRatio: "aspect-[115/82]",
    image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80",
    badge: "5G Ready",
    link: "/category/phones",
  },
];

const renderCard = (item: ShowcaseItem) => (
  <Link
    key={item.id}
    href={item.link}
    data-showcase-card=""
    className={`group relative w-full ${item.aspectRatio} overflow-hidden bg-line transition-opacity duration-300 hover:opacity-90 block`}
  >
    <Image
      src={item.image}
      alt={item.title}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-[1.04] opacity-90 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0"
      sizes="(max-width: 768px) 50vw, 25vw"
    />

    {/* Dark gradient overlay */}
    <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />

    {/* Badge */}
    {item.badge && (
      <div className="absolute top-3 left-3 z-10">
        <span className="px-2 py-0.5 bg-white text-micro font-bold -ink uppercase tracking-wider">
          {item.badge}
        </span>
      </div>
    )}

    {/* Bottom text */}
    <div className="absolute bottom-0 left-0 right-0 p-3.5 z-10">
      <span className="text-micro font-semibold uppercase text-lime">
        {item.category}
      </span>
      <h3 className="mt-0.5 text-sm font-bold text-white leading-tight">{item.title}</h3>
      <p className="mt-0.5 text-xs text-white/70 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {item.description}
      </p>
    </div>
  </Link>
);

export function MasonryShowcase() {
  const col1 = [SHOWCASE_ITEMS[0], SHOWCASE_ITEMS[1]];
  const col2 = [SHOWCASE_ITEMS[2], SHOWCASE_ITEMS[3]];
  const col3 = [SHOWCASE_ITEMS[4], SHOWCASE_ITEMS[5]];
  const col4 = [SHOWCASE_ITEMS[6], SHOWCASE_ITEMS[7]];
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || prefersReducedMotion()) return;

      const cards = sectionRef.current.querySelectorAll("[data-showcase-card]");
      gsap.set(cards, { opacity: 0, y: 24 });

      ScrollTrigger.batch(cards, {
        start: "top 85%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: "power3.out" }),
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id="features" className="py-20 bg-paper -ink border-t-2 border-line">
      <div className="mx-auto max-w-6xl px-4 sm:px-10">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-10">
          <div>
            <div className="text-micro font-semibold uppercase text-lime mb-2">
              What&apos;s in the box
            </div>
            <h2 className="font-extrabold " style={{ fontSize: "clamp(26px, 4vw, 52px)" }}>
              Tools or toys? Both.
            </h2>
          </div>
          <p className="sm:ml-auto max-w-xs text-sm -ink/65 leading-relaxed">
            Flagship engineering, pro camera tech, and next-gen performance — in stock today.
          </p>
        </div>

        {/* 4-column masonry */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5">
          <div className="flex flex-col gap-0.5">{col1.map(renderCard)}</div>
          <div className="flex flex-col gap-0.5">{col2.map(renderCard)}</div>
          <div className="flex flex-col gap-0.5">{col3.map(renderCard)}</div>
          <div className="flex flex-col gap-0.5">{col4.map(renderCard)}</div>
        </div>
      </div>
    </section>
  );
}
