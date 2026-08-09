import { z } from "zod";

const optionalLine = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const shippingAddressSchema = z.object({
  line1: z.string().trim().min(1, "Address is required"),
  line2: optionalLine,
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  postalCode: z.string().trim().min(1, "Postal code is required"),
  country: z.string().trim().min(1, "Country is required"),
});

export const shippingFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  address: shippingAddressSchema,
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type ShippingFormInput = z.infer<typeof shippingFormSchema>;
