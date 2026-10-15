import { create } from "zustand";
import type { MouseEvent } from "react";
import { CHAT_BRANCHES, DEFAULT_BRANCH, distanceKm, type Branch } from "@/shared/branches";
import { DEFAULT_CHAT_MESSAGE, branchWhatsAppLink } from "@/shared/whatsapp";

// "Chat on WhatsApp" goes to the visitor's nearest branch.
//
// Location is read in the browser only and never sent anywhere: it just sorts
// the branches. Once a visitor picks a store (or we know their location
// because they already allowed it), every WhatsApp button links straight to
// that store. Until then a tap opens the StoreChatPicker sheet instead.

export type Coords = { lat: number; lng: number };
export type LocateStatus = "idle" | "locating" | "located" | "denied" | "unavailable";

const CHOICE_KEY = "amrit:chat-store";
const LOCATION_KEY = "amrit:visitor-location";
/** A remembered choice is dropped after this long, in case they've moved. */
const CHOICE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type StoreChatState = {
  /** Branch the visitor picked (remembered across visits). */
  chosenSlug: string | null;
  /** Visitor's position, when they've shared it (kept for this tab session). */
  location: Coords | null;
  status: LocateStatus;
  picker: { open: boolean; message: string };
  openPicker: (message: string) => void;
  closePicker: () => void;
  choose: (slug: string) => void;
  locate: () => void;
  /** Reads saved state; if location access is already allowed, locates silently. */
  hydrate: () => void;
};

export function nearestBranch(location: Coords) {
  return CHAT_BRANCHES.reduce((best, b) => (distanceKm(location, b) < distanceKm(location, best) ? b : best));
}

export const useStoreChat = create<StoreChatState>()((set, get) => ({
  chosenSlug: null,
  location: null,
  status: "idle",
  picker: { open: false, message: DEFAULT_CHAT_MESSAGE },

  openPicker: (message) => {
    set({ picker: { open: true, message } });
    const { location, status } = get();
    if (!location && status !== "denied" && status !== "unavailable") get().locate();
  },
  closePicker: () => set((s) => ({ picker: { ...s.picker, open: false } })),

  choose: (slug) => {
    set({ chosenSlug: slug });
    try {
      localStorage.setItem(CHOICE_KEY, JSON.stringify({ slug, at: Date.now() }));
    } catch {}
  },

  locate: () => {
    if (!("geolocation" in navigator)) {
      set({ status: "unavailable" });
      return;
    }
    set({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = { lat: coords.latitude, lng: coords.longitude };
        set({ location, status: "located" });
        try {
          sessionStorage.setItem(LOCATION_KEY, JSON.stringify(location));
        } catch {}
      },
      (err) => set({ status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable" }),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 10 * 60 * 1000 },
    );
  },

  hydrate: () => {
    try {
      const saved = JSON.parse(localStorage.getItem(CHOICE_KEY) ?? "null") as { slug: string; at: number } | null;
      if (saved && Date.now() - saved.at < CHOICE_TTL_MS && CHAT_BRANCHES.some((b) => b.slug === saved.slug)) {
        set({ chosenSlug: saved.slug });
      }
      const loc = JSON.parse(sessionStorage.getItem(LOCATION_KEY) ?? "null") as Coords | null;
      if (loc) {
        set({ location: loc, status: "located" });
        return;
      }
    } catch {}
    // Already allowed (e.g. on an earlier visit): no prompt appears, so it's
    // fine to look up the nearest store up front and link straight to it.
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((p) => {
        if (p.state === "granted") get().locate();
        if (p.state === "denied") set({ status: "denied" });
      })
      .catch(() => {});
  },
}));

/** The branch WhatsApp buttons go to right now, or null if we don't know yet. */
export function useTargetBranch(): Branch | null {
  return useStoreChat((s) => {
    if (s.chosenSlug) return CHAT_BRANCHES.find((b) => b.slug === s.chosenSlug) ?? null;
    return s.location ? nearestBranch(s.location) : null;
  });
}

/**
 * Props for a "chat on WhatsApp" link: spread onto an <a>. Links straight to
 * the visitor's store when known; otherwise the tap opens the store picker.
 * Without JS it still works, falling back to the city-centre branch.
 * `message` may contain `{store}` for the branch name.
 */
export function useStoreChatLink(message: string = DEFAULT_CHAT_MESSAGE) {
  const branch = useTargetBranch();
  const openPicker = useStoreChat((s) => s.openPicker);
  return {
    href: branchWhatsAppLink(branch ?? DEFAULT_BRANCH, message),
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: (e: MouseEvent<HTMLElement>) => {
      if (branch) return;
      e.preventDefault();
      openPicker(message);
    },
  };
}
