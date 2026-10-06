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

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  brand: z.string().trim().min(1, "Brand is required"),
  description: z.string().trim().min(1, "Description is required"),
  price: z.coerce.number().int().positive("Price must be a positive number"),
  mrp: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().positive().optional()
  ),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  categoryId: z.string().trim().min(1, "Category is required"),
  isActive: z.coerce.boolean(),
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(1, "Name is required"),
  phone: z
    .string()
    .trim()
    .min(10, "Enter a valid phone number")
    .max(15, "Enter a valid phone number"),
  address: z.string().trim().min(1, "Delivery address is required"),
  checkoutMethod: z.enum(["WHATSAPP", "ONLINE_PAYMENT"]),
});
