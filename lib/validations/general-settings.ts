
import { z } from "zod";

const optionalUrl = z.union([
  z.string().trim().url("Valid URL halnu hola"),
  z.literal(""),
]);

export const generalSettingsSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .min(1, "Organization name required chha")
    .max(150, "Organization name dherai lamo bhayo"),

  slogan: z.string().trim().max(200).default(""),
  aboutShort: z.string().trim().max(500).default(""),
  aboutLong: z.string().trim().max(10000).default(""),

  contact: z.object({
    phones: z
      .array(z.string().trim().min(1, "Phone number khali nahos"))
      .max(3, "Maximum 3 ota phone numbers rakhna milchha")
      .default([]),

    emails: z
      .array(z.string().trim().email("Valid email halnu hola"))
      .max(2, "Maximum 2 ota email addresses rakhna milchha")
      .default([]),

    address: z.string().trim().max(300).default(""),
    city: z.string().trim().max(100).default(""),
    postalCode: z.string().trim().max(20).default(""),
  }),

  branding: z.object({
    logo: optionalUrl.default(""),
    favicon: optionalUrl.default(""),
  }),

  socialLinks: z.object({
    facebook: optionalUrl.default(""),
    twitter: optionalUrl.default(""),
    instagram: optionalUrl.default(""),
    linkedin: optionalUrl.default(""),
    youtube: optionalUrl.default(""),
    website: optionalUrl.default(""),
    tiktok: optionalUrl.default(""),
  }),
});

export type GeneralSettingsInput = z.infer<
  typeof generalSettingsSchema
>;
