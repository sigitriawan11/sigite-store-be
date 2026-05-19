import z from "zod";

export const TransactionValidation = {
  createOrder: z.object({
    product_code: z.string().min(1, "Product code is required"),
    channel_code: z.string().min(1, "Channel code is required"),
    phone: z
      .string()
      .min(10, "Phone must be at least 10 digits")
      .max(13, "Phone must be at most 13 digits")
      .regex(/^(08|628)[0-9]{8,11}$/, "Invalid phone number format"),
    email: z.string().email("Invalid email format"),
    account_data: z.record(z.string(), z.string()),
  }),
};
