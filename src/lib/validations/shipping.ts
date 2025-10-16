import { z } from "zod";

export const shippingSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().length(2, "State must be 2 characters (e.g., CA)"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code (e.g., 12345 or 12345-6789)"),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone must be 10 digits (e.g., 5551234567)"),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;
