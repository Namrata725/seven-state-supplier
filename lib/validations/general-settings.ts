
import { z } from "zod";

// Allow empty URLs, otherwise require a valid HTTP/HTTPS URL.
const optionalUrl = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (value === "") return true;

      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    },
    "Please enter a valid HTTP or HTTPS URL"
  )
  .default("");

// Basic international phone number validation.
// Allows digits, spaces, +, -, and parentheses.
const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .max(25, "Phone number is too long")
  .regex(
  /^\+?[0-9\s().-]+$/,
  "Please enter a valid phone number"
);

const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address");

export const generalSettingsSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .min(1, "Organization name is required")
    .max(150, "Organization name is too long"),

  slogan: z.string().trim().max(200).default(""),
  aboutShort: z.string().trim().max(500).default(""),
  aboutLong: z.string().trim().max(10000).default(""),

  contact: z.object({
    phones: z
      .array(phoneSchema)
      .max(3, "Maximum number of phone numbers is 3")
      .default([]),

    emails: z
      .array(emailSchema)
      .max(2, "Maximum number of email addresses is 2")
      .default([]),

    address: z.string().trim().max(300).default(""),
    city: z.string().trim().max(100).default(""),
    postalCode: z.string().trim().max(20).default(""),
  }),

  branding: z.object({
    logo: optionalUrl,
    favicon: optionalUrl,
  }),

  socialLinks: z.object({
    facebook: optionalUrl,
    twitter: optionalUrl,
    instagram: optionalUrl,
    linkedin: optionalUrl,
    youtube: optionalUrl,
    website: optionalUrl,
    tiktok: optionalUrl,
  }),
});

export type GeneralSettingsInput = z.infer<
  typeof generalSettingsSchema
>;

export const updateGeneralSettingsSchema = generalSettingsSchema
  .partial()
  .extend({
    contact: generalSettingsSchema.shape.contact.partial().optional(),
    branding: generalSettingsSchema.shape.branding.partial().optional(),
    socialLinks: generalSettingsSchema.shape.socialLinks.partial().optional(),
  });