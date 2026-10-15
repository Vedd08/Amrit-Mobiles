import { BRANCHES } from "./branches";

export const business = {
  name: "Amrit Mobiles",
  tagline: "Your next phone starts here.",
  phone: "",              // TODO(owner) — leave empty until confirmed
  address: "",            // TODO(owner)
  openingHours: "",       // TODO(owner)
  googleMapsUrl: "",      // TODO(owner)
  instagramUrl: "",       // TODO(owner)
  // TODO(owner): the owner's name for the About studio card ("Owner" is shown until it's set).
  ownerName: "",
} as const;

export const claims = {
  pillar1: { title: "Genuine products", body: "Authentic smartphones from trusted brands." },
  pillar2: { title: "Expert guidance", body: "Get help choosing a phone that actually fits your needs." },
  pillar3: { title: "Competitive pricing", body: "Great value without unnecessary complexity." },
  pillar4: { title: "Personal service", body: "Real assistance before and after your purchase." },
};

export { BRANCHES };
