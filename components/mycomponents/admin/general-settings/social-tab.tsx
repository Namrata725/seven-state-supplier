"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import { Globe, Pencil, Save, X, Loader2 } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaTwitter,
  FaTiktok,
} from "react-icons/fa";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SocialLinks = {
  website: string;
  facebook: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  twitter: string;
  tiktok: string;
};

type SocialField = keyof SocialLinks;

const EMPTY_FORM: SocialLinks = {
  website: "",
  facebook: "",
  instagram: "",
  youtube: "",
  linkedin: "",
  twitter: "",
  tiktok: "",
};

const FIELD_CONFIG: {
  name: SocialField;
  label: string;
  placeholder: string;
  description: string;
  icon: IconType | typeof Globe;
}[] = [
  {
    name: "website",
    label: "Website",
    placeholder: "https://example.com",
    description: "Your official website URL.",
    icon: Globe,
  },
  {
    name: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/yourpage",
    description: "Your Facebook page URL.",
    icon: FaFacebookF,
  },
  {
    name: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/yourprofile",
    description: "Your Instagram profile URL.",
    icon: FaInstagram,
  },
  {
    name: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@yourchannel",
    description: "Your YouTube channel URL.",
    icon: FaYoutube,
  },
  {
    name: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/company/yourpage",
    description: "Your LinkedIn company page URL.",
    icon: FaLinkedinIn,
  },
  {
    name: "twitter",
    label: "Twitter / X",
    placeholder: "https://x.com/yourprofile",
    description: "Your Twitter or X profile URL.",
    icon: FaTwitter,
  },
  {
    name: "tiktok",
    label: "TikTok",
    placeholder: "https://tiktok.com/@yourprofile",
    description: "Your TikTok profile URL.",
    icon: FaTiktok,
  },
];

function validateSocialLinks(form: SocialLinks): string | null {
  for (const field of FIELD_CONFIG) {
    const value = form[field.name].trim();

    if (!value) continue;

    try {
      const url = new URL(value);

      if (!["http:", "https:"].includes(url.protocol)) {
        return `${field.label} must use a valid HTTP or HTTPS URL.`;
      }
    } catch {
      return `Please enter a valid ${field.label} URL.`;
    }
  }

  return null;
}

export default function SocialTab() {
  const [form, setForm] = useState<SocialLinks>(EMPTY_FORM);
  const [original, setOriginal] = useState<SocialLinks>(EMPTY_FORM);
  const [editing, setEditing] = useState<SocialField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = useMemo(
    () => FIELD_CONFIG.some(({ name }) => form[name] !== original[name]),
    [form, original],
  );

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/public/general-settings", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "Create general settings first."
            : "Failed to load social settings.",
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to load social settings.");
      }

      const loaded: SocialLinks = {
        website: result.data?.socialLinks?.website ?? "",
        facebook: result.data?.socialLinks?.facebook ?? "",
        instagram: result.data?.socialLinks?.instagram ?? "",
        youtube: result.data?.socialLinks?.youtube ?? "",
        linkedin: result.data?.socialLinks?.linkedin ?? "",
        twitter: result.data?.socialLinks?.twitter ?? "",
        tiktok: result.data?.socialLinks?.tiktok ?? "",
      };

      setForm(loaded);
      setOriginal(loaded);
      setEditing([]);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load social settings.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const handleChange = (name: SocialField, value: string) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = (name: SocialField) => {
    setEditing((previous) =>
      previous.includes(name) ? previous : [...previous, name],
    );
  };

  const handleDiscard = () => {
    setForm(original);
    setEditing([]);
  };

  const handleSave = async () => {
    const validationError = validateSocialLinks(form);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const changedFields = FIELD_CONFIG.filter(
      ({ name }) => form[name] !== original[name],
    );

    if (changedFields.length === 0) {
      toast.info("No changes to save.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        socialLinks: Object.fromEntries(
          changedFields.map(({ name }) => [name, form[name].trim()]),
        ),
      };

      await fetch("/api/admin/settings/general", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const response = await fetch("/api/admin/settings/general", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save social settings.");
      }

      toast.success("Social settings saved successfully.");
      await fetchSettings();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save social settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-2xl border border-primary/20 bg-white shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-slate-500">
            Loading social settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-3">
      {/* Form Card */}
      <div className="overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-xl shadow-primary/10">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-3 border-b border-primary/15 bg-gradient-to-b from-primary/5 to-primary/10 px-4 py-3 md:px-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Social Media &amp; Links
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Manage your website and social media profile links.
            </p>
          </div>

          <span className="rounded-full border border-primary/20 bg-white px-2.5 py-0.5 text-[11px] font-medium text-primary">
            {FIELD_CONFIG.length} Fields
          </span>
        </div>

        {/* Fields: 2 columns on large screens */}
        <div className="grid gap-px bg-primary/10 lg:grid-cols-2">
          {FIELD_CONFIG.map((field) => {
            const isEditing = editing.includes(field.name);
            const Icon = field.icon;

            return (
              <div
                key={field.name}
                className="min-w-0 bg-white px-4 py-3.5 transition-colors hover:bg-primary/[0.03] md:px-5 lg:odd:last:col-span-2"
              >
                {/* Label */}
                <div className="mb-2.5 flex min-w-0 items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/70 to-primary text-primary-foreground shadow-sm shadow-primary/30">
                    <Icon className="size-3.5" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <Label
                      htmlFor={field.name}
                      className="text-[13px] font-semibold text-slate-800"
                    >
                      {field.label}
                    </Label>

                    <p className="truncate text-[11px] leading-snug text-slate-500">
                      {field.description}
                    </p>
                  </div>
                </div>

                {/* Input + edit button */}
                <div className="flex items-start gap-2">
                  <Input
                    id={field.name}
                    type="url"
                    value={form[field.name]}
                    onChange={(event) =>
                      handleChange(field.name, event.target.value)
                    }
                    placeholder={field.placeholder}
                    readOnly={!isEditing}
                    maxLength={2048}
                    className={`h-9 flex-1 rounded-lg border text-[13px] text-slate-700 placeholder:text-slate-400 transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 ${
                      isEditing
                        ? "border-primary/40 bg-white"
                        : "cursor-default border-primary/15 bg-primary/5"
                    }`}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 shrink-0 rounded-lg border-primary/30 bg-white text-primary transition-all hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary"
                    onClick={() => handleEdit(field.name)}
                    disabled={isSaving || isEditing}
                    aria-label={`Edit ${field.label}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </div>

                {/* Character Counter */}
                <p className="mt-1 text-right text-[10px] tabular-nums text-slate-400">
                  {form[field.name].length.toLocaleString()} / 2,048
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Actions */}
      {isDirty && (
        <div className="sticky bottom-3 z-10 flex flex-col justify-between gap-3 rounded-xl border border-primary/30 bg-white/95 px-4 py-2.5 shadow-xl shadow-primary/20 backdrop-blur-md sm:flex-row sm:items-center md:px-5">
          <div className="flex items-center gap-3">
            <span className="size-2.5 shrink-0 animate-pulse rounded-full bg-primary" />

            <div className="space-y-0.5">
              <p className="text-[13px] font-bold text-slate-800">
                Unsaved changes
              </p>
              <p className="text-[11px] text-slate-500">
                Your social links haven&apos;t been saved yet.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full border-primary/30 bg-white text-[13px] text-slate-600 hover:bg-primary/10 hover:text-primary sm:w-auto"
              onClick={handleDiscard}
              disabled={isSaving}
            >
              <X className="mr-2 size-4" />
              Discard
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 w-full bg-primary text-[13px] text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary/90 sm:w-auto sm:min-w-36"
            >
              {isSaving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
