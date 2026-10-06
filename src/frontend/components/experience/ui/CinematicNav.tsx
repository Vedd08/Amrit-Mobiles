'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function CinematicNav() {
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let lastY = 0;
    const handleScroll = () => {
      const currentY = window.scrollY;
      const isPortalHiding = document.body.classList.contains('hide-cinematic-nav');
      if (isPortalHiding || (currentY > 200 && currentY > lastY)) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastY = currentY;
    };

    const observer = new MutationObserver(() => handleScroll());
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [mobileOpen]);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between transition-transform duration-500 bg-paper/80 backdrop-blur-md border-b border-line text-ink ${hidden && !mobileOpen ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <Link href="/" className="font-heading font-bold text-xl tracking-tighter">
          AMRIT MOBILES
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/phones" className="text-sm font-medium hover:opacity-70 transition-opacity">Phones</Link>
          <a href="#brands" className="text-sm font-medium hover:opacity-70 transition-opacity">Brands</a>
          <a href="#why" className="text-sm font-medium hover:opacity-70 transition-opacity">About</a>
          <a href="#stores" className="text-sm font-medium hover:opacity-70 transition-opacity">Contact</a>
          <Link 
            href="/phones" 
            className="bg-lime text-[#2A2A2A] text-sm font-bold px-5 py-2 rounded-full transition-transform duration-160 hover:scale-[1.02]"
          >
            Shop Phones
          </Link>
        </div>

        <button 
          className="md:hidden flex flex-col gap-1.5 p-2 z-50"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <div className={`w-6 h-0.5 bg-ink transition-transform ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <div className={`w-6 h-0.5 bg-ink transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
          <div className={`w-6 h-0.5 bg-ink transition-transform ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-paper flex flex-col items-center justify-center gap-8 px-6">
          <Link href="/phones" onClick={() => setMobileOpen(false)} className="text-3xl font-bold text-ink tracking-tighter">Phones</Link>
          <a href="#brands" onClick={() => setMobileOpen(false)} className="text-3xl font-bold text-ink tracking-tighter">Brands</a>
          <a href="#why" onClick={() => setMobileOpen(false)} className="text-3xl font-bold text-ink tracking-tighter">About</a>
          <a href="#stores" onClick={() => setMobileOpen(false)} className="text-3xl font-bold text-ink tracking-tighter">Contact</a>
          <Link 
            href="/phones" 
            onClick={() => setMobileOpen(false)}
            className="bg-lime text-[#2A2A2A] text-xl font-bold px-8 py-4 rounded-full mt-4"
          >
            Shop Phones
          </Link>
        </div>
      )}
    </>
  );
}
