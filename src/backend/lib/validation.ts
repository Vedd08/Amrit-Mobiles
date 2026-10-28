import { z } from "zod";

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export const productSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    brand: z.string().trim().min(1, "Brand is required"),
    description: z.string().trim().min(1, "Description is required"),
    price: z.coerce.number().int("Price must be a whole rupee amount").positive("Price must be a positive number"),
    mrp: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().int("MRP must be a whole rupee amount").positive("MRP must be a positive number").optional()
    ),
    stock: z.coerce.number().int("Stock must be a whole number").min(0, "Stock cannot be negative"),
    categoryId: z.string().trim().min(1, "Category is required"),
    isActive: z.coerce.boolean(),
  })
  .refine((data) => data.mrp === undefined || data.mrp >= data.price, {
    message: "MRP cannot be lower than the selling price",
    path: ["mrp"],
  });

/** Indian mobile number -> 10 digits (accepts spaces, dashes, +91 or a leading 0). */
export function normalizeIndianMobile(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your name").max(80, "That name is too long"),
  phone: z
    .string()
    .transform(normalizeIndianMobile)
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a 10-digit mobile number"),
  address: z.string().trim().min(5, "Enter your address or area").max(300, "That address is too long"),
  // Online payment isn't live yet: every order is completed on WhatsApp.
  checkoutMethod: z.literal("WHATSAPP"),
  branchSlug: z.string().min(1, "Choose a store"),
  note: z.string().trim().max(300, "That note is too long").optional().default(""),
});
