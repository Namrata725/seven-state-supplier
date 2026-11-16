"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ImagePlus,
  ImageIcon,
  Upload,
  Trash2,
  Pencil,
  Save,
  X,
  Loader2,
  Globe,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type BrandingForm = {
  logo: string;
  favicon: string;
};

type ImageField = keyof BrandingForm;

const EMPTY_FORM: BrandingForm = {
  logo: "",
  favicon: "",
};

const IMAGE_CONFIG: {
  name: ImageField;
  label: string;
  description: string;
  icon: typeof ImagePlus;
}[] = [
  {
    name: "logo",
    label: "Website Logo",
    description: "Your store's main logo displayed across the website.",
    icon: ImagePlus,
  },
  {
    name: "favicon",
    label: "Website Favicon",
    description: "The small icon displayed in the browser tab.",
    icon: Globe,
  },
];

export default function BrandingTab() {
  const [form, setForm] = useState<BrandingForm>(EMPTY_FORM);
  const [original, setOriginal] = useState<BrandingForm>(EMPTY_FORM);
  const [editing, setEditing] = useState<ImageField[]>([]);
  const [uploading, setUploading] = useState<ImageField | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = useMemo(
    () => IMAGE_CONFIG.some(({ name }) => form[name] !== original[name]),
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
            : "Failed to load branding settings.",
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to load branding settings.");
      }

      const loaded: BrandingForm = {
        logo: result.data?.branding?.logo ?? "",
        favicon: result.data?.branding?.favicon ?? "",
      };

      setForm(loaded);
      setOriginal(loaded);
      setEditing([]);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load branding settings.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const handleEdit = (name: ImageField) => {
    setEditing((previous) =>
      previous.includes(name) ? previous : [...previous, name],
    );
  };

  const handleDiscard = () => {
    setForm(original);
    setEditing([]);
  };

  const handleImageUpload = async (file: File, type: ImageField) => {
    if (!file.type.match(/^image\/(png|jpeg|webp)$/)) {
      toast.error("Please select a PNG, JPG or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      return;
    }

    setUploading(type);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "general");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.data?.url) {
        throw new Error(result.message || "Image upload failed.");
      }

      setForm((previous) => ({
        ...previous,
        [type]: result.data.url,
      }));

      toast.success(
        `${type === "logo" ? "Logo" : "Favicon"} uploaded successfully.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Image upload failed.",
      );
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    const changedFields = IMAGE_CONFIG.filter(
      ({ name }) => form[name] !== original[name],
    );

    if (changedFields.length === 0) {
      toast.info("No changes to save.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        branding: {
          logo: form.logo,
          favicon: form.favicon,
        },
      };

      const response = await fetch("/api/admin/settings/general", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save branding settings.");
      }

      toast.success("Branding settings saved successfully.");
      await fetchSettings();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save branding settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderImageField = (field: (typeof IMAGE_CONFIG)[number]) => {
    const { name, label, description, icon: Icon } = field;
    const isEditing = editing.includes(name);
    const isUploading = uploading === name;

    return (
      <div
        key={name}
        className="grid gap-3 px-4 py-3.5 transition-colors hover:bg-primary/[0.03] md:grid-cols-[210px_minmax(0,1fr)] md:gap-6 md:px-5"
      >
        {/* Label */}
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/70 to-primary text-primary-foreground shadow-sm shadow-primary/30">
            <Icon className="size-3.5" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <Label className="text-[13px] font-semibold text-slate-800">
              {label}
            </Label>
            <p className="text-[11px] leading-snug text-slate-500">
              {description}
            </p>
          </div>
        </div>

        {/* Preview + controls + edit button */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-2">
            {form[name] ? (
              <img
                src={form[name]}
                alt={`${label} preview`}
                className="size-full object-contain"
              />
            ) : (
              <ImageIcon className="size-7 text-slate-300" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            {isEditing ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading || isSaving}
                    onClick={() =>
                      document.getElementById(`${name}-upload`)?.click()
                    }
                    className="h-8 rounded-lg border-primary/30 bg-white text-[12px] text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-1.5 size-3.5" />
                        {form[name] ? "Replace Image" : "Upload Image"}
                      </>
                    )}
                  </Button>

                  {form[name] && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isUploading || isSaving}
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          [name]: "",
                        }))
                      }
                      className="h-8 rounded-lg text-[12px] text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="mr-1.5 size-3.5" />
                      Remove
                    </Button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400">
                  PNG, JPG or WebP. Maximum size: 5MB.
                </p>

                <input
                  id={`${name}-upload`}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      void handleImageUpload(file, name);
                    }

                    event.target.value = "";
                  }}
                />
              </>
            ) : (
              <p className="text-[12px] text-slate-500">
                {form[name] ? "Image uploaded" : "No image configured"}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0 rounded-lg border-primary/30 bg-white text-primary transition-all hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary"
            onClick={() => handleEdit(name)}
            disabled={isSaving || isUploading || isEditing}
            aria-label={`Edit ${label}`}
          >
            <Pencil className="size-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-2xl border border-primary/20 bg-white shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-slate-500">
            Loading branding settings...
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
              Website Branding
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Manage your store logo and browser favicon.
            </p>
          </div>

          <span className="rounded-full border border-primary/20 bg-white px-2.5 py-0.5 text-[11px] font-medium text-primary">
            {IMAGE_CONFIG.length} Assets
          </span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-primary/10">
          {IMAGE_CONFIG.map(renderImageField)}
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
                Your branding changes haven&apos;t been saved yet.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full border-primary/30 bg-white text-[13px] text-slate-600 hover:bg-primary/10 hover:text-primary sm:w-auto"
              onClick={handleDiscard}
              disabled={isSaving || uploading !== null}
            >
              <X className="mr-2 size-4" />
              Discard
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || uploading !== null}
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
