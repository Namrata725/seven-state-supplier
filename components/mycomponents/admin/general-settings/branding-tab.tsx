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
  Palette,
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
        className="rounded-xl border border-orange-100 bg-orange-50/30 p-4 transition-colors hover:border-orange-200"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-100">
              <Icon className="size-4 text-orange-600" />
            </div>

            <div className="min-w-0 space-y-1">
              <Label className="text-sm font-semibold text-slate-800">
                {label}
              </Label>
              <p className="text-xs leading-relaxed text-slate-500">
                {description}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0 border-orange-200 bg-white text-orange-600 hover:bg-orange-100"
            onClick={() => handleEdit(name)}
            disabled={isSaving || isUploading || isEditing}
            aria-label={`Edit ${label}`}
          >
            <Pencil className="size-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-orange-100 bg-white p-2">
            {form[name] ? (
              <img
                src={form[name]}
                alt={`${label} preview`}
                className="size-full object-contain"
              />
            ) : (
              <ImageIcon className="size-8 text-slate-300" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
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
                    className="border-orange-200 bg-white text-orange-700 hover:bg-orange-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 size-4" />
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
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Remove
                    </Button>
                  )}
                </div>

                <p className="text-xs text-slate-400">
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
              <p className="text-xs text-slate-500">
                {form[name] ? "Image uploaded" : "No image configured"}
              </p>
            )}

            <p className="text-[11px] text-slate-400">
              {isEditing ? "Editing enabled" : "Read only"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-2xl border border-orange-100 bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-orange-500" />
          <p className="text-sm font-medium text-slate-500">
            Loading branding settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="mt-8 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-6 flex items-center justify-between gap-3 border-b border-orange-100 pb-4">
          <div>
            <h3 className="font-semibold text-slate-800">Website Branding</h3>
            <p className="mt-1 text-xs text-slate-500">
              Manage your store logo and browser favicon.
            </p>
          </div>

          <span className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
            2 Assets
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {IMAGE_CONFIG.map(renderImageField)}
        </div>
      </div>

      {isDirty && (
        <div className="sticky bottom-3 z-10 flex flex-col justify-between gap-4 rounded-2xl border border-orange-200 bg-white/95 p-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-center md:px-5">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800">Unsaved changes</p>
            <p className="text-xs text-slate-500">
              Your branding changes haven't been saved yet.
            </p>
          </div>

          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="w-full border-orange-200 bg-white text-slate-600 hover:bg-orange-50 sm:w-auto"
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
              className="w-full bg-orange-500 text-white hover:bg-orange-600 sm:min-w-36 sm:w-auto"
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
