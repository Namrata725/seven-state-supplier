"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Pencil,
  Save,
  X,
  Loader2,
  FileText,
  Type,
  AlignLeft,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type GeneralForm = {
  organizationName: string;
  slogan: string;
  aboutShort: string;
  aboutLong: string;
};

type FieldName = keyof GeneralForm;

const EMPTY_FORM: GeneralForm = {
  organizationName: "",
  slogan: "",
  aboutShort: "",
  aboutLong: "",
};

const FIELD_CONFIG: {
  name: FieldName;
  label: string;
  placeholder: string;
  description: string;
  maxLength: number;
  multiline?: boolean;
  icon: typeof Building2;
}[] = [
  {
    name: "organizationName",
    label: "Organization Name",
    placeholder: "Enter organization name",
    description: "Your company's official name.",
    maxLength: 150,
    icon: Building2,
  },
  {
    name: "slogan",
    label: "Slogan",
    placeholder: "Enter your organization slogan",
    description: "A short tagline for your organization.",
    maxLength: 200,
    icon: Type,
  },
  {
    name: "aboutShort",
    label: "Short Description",
    placeholder: "Write a short description",
    description: "A brief introduction to your organization.",
    maxLength: 500,
    multiline: true,
    icon: AlignLeft,
  },
  {
    name: "aboutLong",
    label: "About Organization",
    placeholder: "Write about your organization",
    description: "Detailed information about your organization.",
    maxLength: 10000,
    multiline: true,
    icon: FileText,
  },
];

function validateForm(form: GeneralForm): string | null {
  if (!form.organizationName.trim()) {
    return "Organization name is required.";
  }

  if (form.organizationName.trim().length > 150) {
    return "Organization name cannot exceed 150 characters.";
  }

  if (form.slogan.length > 200) {
    return "Slogan cannot exceed 200 characters.";
  }

  if (form.aboutShort.length > 500) {
    return "Short description cannot exceed 500 characters.";
  }

  if (form.aboutLong.length > 10000) {
    return "About organization cannot exceed 10,000 characters.";
  }

  return null;
}

export default function GeneralTab() {
  const [form, setForm] = useState<GeneralForm>(EMPTY_FORM);
  const [original, setOriginal] = useState<GeneralForm>(EMPTY_FORM);
  const [editing, setEditing] = useState<FieldName[]>([]);

  const [isCreateMode, setIsCreateMode] = useState(false);
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

      if (response.status === 404) {
        setIsCreateMode(true);
        setForm(EMPTY_FORM);
        setOriginal(EMPTY_FORM);
        setEditing(FIELD_CONFIG.map(({ name }) => name));
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load general settings.");
      }

      const loaded: GeneralForm = {
        organizationName: result.data.organizationName ?? "",
        slogan: result.data.slogan ?? "",
        aboutShort: result.data.aboutShort ?? "",
        aboutLong: result.data.aboutLong ?? "",
      };

      setForm(loaded);
      setOriginal(loaded);
      setEditing([]);
      setIsCreateMode(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load general settings.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (name: FieldName, value: string) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = (name: FieldName) => {
    setEditing((previous) =>
      previous.includes(name) ? previous : [...previous, name],
    );
  };

  const handleDiscard = () => {
    setForm(original);
    setEditing([]);
  };

  const handleSave = async () => {
    const validationError = validateForm(form);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const changedFields = Object.fromEntries(
      FIELD_CONFIG.filter(({ name }) => form[name] !== original[name]).map(
        ({ name }) => [name, form[name]],
      ),
    );

    if (!isCreateMode && Object.keys(changedFields).length === 0) {
      toast.info("No changes to save.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = isCreateMode
        ? {
            ...form,
            contact: {
              phones: [],
              emails: [],
              address: "",
              city: "",
              postalCode: "",
            },
            branding: {
              logo: "",
              favicon: "",
            },
            socialLinks: {
              facebook: "",
              twitter: "",
              instagram: "",
              linkedin: "",
              youtube: "",
              website: "",
              tiktok: "",
            },
          }
        : changedFields;

      const response = await fetch("/api/admin/settings/general", {
        method: isCreateMode ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save general settings.");
      }

      toast.success(
        isCreateMode
          ? "General settings created successfully."
          : "General settings updated successfully.",
      );

      await fetchSettings();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save general settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-2xl border border-orange-100 bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-orange-500" />
          <p className="text-sm font-medium text-slate-500">
            Loading organization settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Section Header */}
      {/* <div className="flex flex-col justify-between gap-4 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center md:p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-100">
            <Building2 className="size-6 text-orange-600" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-800">
              Organization Information
            </h2>

            <p className="text-sm text-slate-500">
              Manage your organization's name and general description.
            </p>
          </div>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
          <span className="size-2 rounded-full bg-orange-500" />
          {isCreateMode ? "New configuration" : "General details"}
        </div>
      </div> */}

      {/* Form Fields */}
      <div className="rounded-2xl mt-8 border border-orange-100 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-6 flex items-center justify-between gap-3 border-b border-orange-100 pb-4">
          <div>
            <h3 className="font-semibold text-slate-800">Basic Information</h3>
            <p className="mt-1 text-xs text-slate-500">
              Fill in the details displayed across your store.
            </p>
          </div>

          <span className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
            {FIELD_CONFIG.length} Fields
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {FIELD_CONFIG.map((field) => {
            const isEditing = isCreateMode || editing.includes(field.name);

            const Icon = field.icon;

            return (
              <div
                key={field.name}
                className={`min-w-0 rounded-xl border border-orange-100 bg-orange-50/30 p-4 transition-colors hover:border-orange-200 ${
                  field.name === "aboutLong" ? "lg:col-span-2" : ""
                }`}
              >
                {/* Field Header */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                      <Icon className="size-4 text-orange-600" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <Label className="text-sm font-semibold text-slate-800">
                        {field.label}
                      </Label>

                      <p className="text-xs leading-relaxed text-slate-500">
                        {field.description}
                      </p>
                    </div>
                  </div>

                  {!isCreateMode && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9 shrink-0 border-orange-200 bg-white text-orange-600 hover:border-orange-400 hover:bg-orange-100 hover:text-orange-700"
                      onClick={() => handleEdit(field.name)}
                      disabled={isSaving || isEditing}
                      aria-label={`Edit ${field.label}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  )}
                </div>

                {/* Input */}
                {field.multiline ? (
                  <Textarea
                    value={form[field.name]}
                    onChange={(event) =>
                      handleChange(field.name, event.target.value)
                    }
                    placeholder={field.placeholder}
                    readOnly={!isEditing}
                    maxLength={field.maxLength}
                    rows={field.name === "aboutLong" ? 8 : 5}
                    className="min-h-28 resize-y rounded-lg border-orange-100 bg-white text-sm text-slate-700 placeholder:text-slate-400 read-only:cursor-default read-only:bg-orange-50/50 focus-visible:border-orange-400 focus-visible:ring-orange-200"
                  />
                ) : (
                  <Input
                    value={form[field.name]}
                    onChange={(event) =>
                      handleChange(field.name, event.target.value)
                    }
                    placeholder={field.placeholder}
                    readOnly={!isEditing}
                    maxLength={field.maxLength}
                    className="h-11 rounded-lg border-orange-100 bg-white text-sm text-slate-700 placeholder:text-slate-400 read-only:cursor-default read-only:bg-orange-50/50 focus-visible:border-orange-400 focus-visible:ring-orange-200"
                  />
                )}

                {/* Character Counter */}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    {isEditing ? "Editing enabled" : "Read only"}
                  </span>

                  <span className="text-xs tabular-nums text-slate-400">
                    {form[field.name].length.toLocaleString()} /{" "}
                    {field.maxLength.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Actions */}
      {(isCreateMode || isDirty) && (
        <div className="sticky bottom-3 z-10 flex flex-col justify-between gap-4 rounded-2xl border border-orange-200 bg-white/95 p-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-center md:px-5">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800">
              {isCreateMode ? "Create settings" : "Unsaved changes"}
            </p>

            <p className="text-xs text-slate-500">
              {isCreateMode
                ? "Add your organization's information."
                : "Your changes haven't been saved yet."}
            </p>
          </div>

          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
            {!isCreateMode && (
              <Button
                type="button"
                variant="outline"
                className="w-full border-orange-200 bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-700 sm:w-auto"
                onClick={handleDiscard}
                disabled={isSaving}
              >
                <X className="mr-2 size-4" />
                Discard
              </Button>
            )}

            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-orange-500 text-white shadow-sm hover:bg-orange-600 sm:min-w-36 sm:w-auto"
            >
              {isSaving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}

              {isCreateMode ? "Create Settings" : "Save Changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
