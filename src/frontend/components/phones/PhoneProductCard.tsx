"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import type { ProductCardData } from "@/frontend/components/shop/ProductCard";
import { useReducedMotion } from "@/frontend/lib/use-reduced-motion";
import { useCartStore } from "@/frontend/store/cart-store";
import { useWishlistStore, wishlistHas } from "@/frontend/store/wishlist-store";
import { useMounted } from "@/frontend/lib/use-mounted";
import { formatINR } from "@/frontend/lib/phone-experience-data";
import { ramGB, storageGB, savings, is5G, monthlyEmi } from "@/shared/phone-catalog";
import { HeartIcon } from "./icons";

/**
 * The card the whole /phones section is built from.
 */
export function PhoneProductCard({
  product,
  priority = false,
  badge,
  quickView = false,
}: {
  product: ProductCardData;
  priority?: boolean;
  /** Small marker on the image, e.g. "New" or "12% off". Used sparingly. */
  badge?: string;
  quickView?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const mounted = useMounted();
  const addItem = useCartStore((s) => s.addItem);
  const toggleSaved = useWishlistStore((s) => s.toggle);
  const saved = useWishlistStore((s) => wishlistHas(s.items, product.slug));
  const [added, setAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const ram = ramGB(product);
  const storage = storageGB(product);
  const has5G = is5G(product);
  const specs = [ram && `${ram} GB`, storage && `${storage} GB`, has5G && "5G"].filter(Boolean) as string[];
  const save = savings(product);
  const emi = monthlyEmi(product.price);
  const outOfStock = product.stock === 0;
  const isSaved = mounted && saved;

  function addToCart() {
    if (outOfStock) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      },
      1,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-md border border-line bg-surface shadow-sh-1 transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-steel hover:shadow-sh-2 hover:-translate-y-1 motion-reduce:hover:translate-y-0 motion-reduce:transition-colors">
      <button
        type="button"
        onClick={() => toggleSaved(product)}
        aria-pressed={mounted ? saved : undefined}
        aria-label={isSaved ? `Remove ${product.name} from your wishlist` : `Save ${product.name} to your wishlist`}
        className="absolute right-2.5 top-2.5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-surface/95 border border-line text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
      >
        <HeartIcon className={`h-[18px] w-[18px] ${isSaved ? "text-danger" : ""}`} filled={isSaved} />
      </button>

      <Link 
        href={`/product/${product.slug}`} 
        onClick={(e) => {
          if (quickView) {
            e.preventDefault();
            setShowModal(true);
          }
        }}
        className="flex flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
      >
        <div className={`relative aspect-[4/5] w-full flex items-center justify-center bg-paper-2 overflow-hidden ${outOfStock ? "grayscale opacity-60" : ""}`}>
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 40vw, 45vw"
              priority={priority}
              className="object-cover transition-transform duration-[320ms] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-3">No image</div>
          )}
          {badge && !outOfStock && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-lime px-2 py-0.5 text-micro font-semibold tracking-wide text-[#2A2A2A] z-20">
              {badge}
            </span>
          )}
          {outOfStock && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface px-3 py-1 text-micro font-semibold uppercase tracking-wide text-ink z-20">
              Sold out
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 p-3.5 pb-2.5 relative z-20">
          <div className="flex items-center justify-between gap-2">
            <p className="text-micro font-semibold tracking-widest uppercase text-ink-3">{product.brand}</p>
            {!outOfStock && product.stock <= 3 && (
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-danger"></span>
                <span className="text-micro font-semibold text-danger uppercase tracking-widest">Only {product.stock} left</span>
              </div>
            )}
          </div>
          <h3 className="line-clamp-2 min-h-[2.75em] text-body font-bold leading-snug text-ink">
            {product.name}
          </h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {specs.map(spec => (
              <span key={spec} className="rounded-full bg-paper-2 px-2 py-0.5 text-micro text-ink-2">
                {spec}
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-body-lg font-extrabold tabular-nums text-ink">{formatINR(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-micro tabular-nums text-ink-3 line-through">{formatINR(product.mrp)}</span>
            )}
            {save >= 1000 && (
              <span className="rounded-full bg-lime/25 px-1.5 py-0.5 text-micro font-semibold text-ink">Save {formatINR(save)}</span>
            )}
          </div>
          <p className="text-micro text-ink-3">or {formatINR(emi)}/mo on 0% EMI</p>
        </div>
      </Link>

      <div className="mt-auto px-3.5 pb-3.5 relative z-20">
        <button
          type="button"
          onClick={addToCart}
          disabled={outOfStock}
          aria-label={outOfStock ? "Sold out" : `Add ${product.name} to cart`}
          className="w-full flex items-center justify-center gap-1.5 rounded-full bg-paper-2 py-2 text-small font-semibold text-ink transition-colors hover:bg-lime hover:text-[#2A2A2A] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-paper-2 disabled:hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
        >
          {outOfStock ? (
            "Sold out"
          ) : added ? (
            <>
              <svg className={`h-3.5 w-3.5 text-[inherit] ${!reducedMotion ? "animate-[bounce_0.3s_ease-out]" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Added</span>
            </>
          ) : (
            "Add to cart"
          )}
        </button>
      </div>

      {quickView && showModal && (
        <QuickViewModal
          product={product}
          onClose={() => setShowModal(false)}
          onAdd={addToCart}
          added={added}
          outOfStock={outOfStock}
          reducedMotion={reducedMotion}
        />
      )}
    </article>
  );
}

function QuickViewModal({
  product,
  onClose,
  onAdd,
  added,
  outOfStock,
  reducedMotion,
}: {
  product: ProductCardData;
  onClose: () => void;
  onAdd: () => void;
  added: boolean;
  outOfStock: boolean;
  reducedMotion: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleClose() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={() => {
        document.body.style.overflow = "";
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) handleClose();
      }}
      className="backdrop:bg-paper/70 backdrop:backdrop-blur-sm p-0 rounded-lg shadow-sh-2 w-[90vw] max-w-2xl m-auto bg-surface"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view of ${product.name}`}
    >
      <div className="bg-surface flex flex-col md:flex-row h-full max-h-[85vh] overflow-y-auto rounded-lg">
        <div className="w-full md:w-1/2 bg-paper p-8 flex items-center justify-center relative">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="md:hidden absolute top-4 right-4 h-8 w-8 rounded-full bg-surface flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
          >
            <svg className="w-4 h-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative aspect-square w-full max-w-[240px]">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill className="object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-ink-3">No image</div>
            )}
          </div>
        </div>
        
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col relative text-ink">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="hidden md:flex absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-paper items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
          >
            <svg className="w-4 h-4 text-ink-3 hover:text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <p className="text-micro font-semibold tracking-widest text-ink-3 uppercase mb-2">{product.brand}</p>
          <h2 className="text-h3 font-semibold text-ink mb-2">{product.name}</h2>
          
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-h3 font-bold tabular-nums text-ink">{formatINR(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-small font-semibold text-ink-3 line-through tabular-nums">{formatINR(product.mrp)}</span>
            )}
          </div>

          <div className="mt-auto pt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={onAdd}
              disabled={outOfStock}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-lime py-3 text-small font-bold text-[#2A2A2A] transition-colors hover:bg-lime-lo disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
            >
              {outOfStock ? (
                "Sold out"
              ) : added ? (
                <>
                  <svg className={`h-4 w-4 text-[inherit] ${!reducedMotion ? "animate-[bounce_0.3s_ease-out]" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Added to cart</span>
                </>
              ) : (
                "Add to cart"
              )}
            </button>
            <Link 
              href={`/product/${product.slug}`}
              className="w-full text-center text-small font-bold text-ink-3 hover:text-ink underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-ink"
            >
              View full details
            </Link>
          </div>
        </div>
      </div>
    </dialog>
  );
}
