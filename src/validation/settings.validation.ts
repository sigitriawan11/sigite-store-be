import { z } from "zod";

export const updateSettingsSchema = z.object({
  settings: z
    .object({
      site_name: z
        .string()
        .min(1, "Site name is required")
        .max(100, "Site name must be at most 100 characters")
        .optional(),
      site_description: z
        .string()
        .max(500, "Site description must be at most 500 characters")
        .optional(),
      contact_email: z
        .string()
        .email("Invalid email format")
        .optional(),
      contact_phone: z
        .string()
        .min(8, "Phone number must be at least 8 characters")
        .max(20, "Phone number must be at most 20 characters")
        .optional(),
      logo_url: z
        .string()
        .optional(),
      allow_registration: z
        .boolean()
        .optional(),
      maintenance_mode: z
        .boolean()
        .optional(),
      default_role_id: z
        .string()
        .uuid("Invalid role ID format")
        .optional(),
      email_verification_required: z
        .boolean()
        .optional(),
    })
    .optional()
    .default({}),
});