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
      <div className="flex min-h-60 items-center justify-center rounded-2xl border border-primary/20 bg-white shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-slate-500">
            Loading organization settings...
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
            <h3 className="text-[13px] font-semibold text-slate-800">
              Basic Information
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Fill in the details displayed across your store.
            </p>
          </div>

          <span className="rounded-full border border-primary/20 bg-white px-2.5 py-0.5 text-[11px] font-medium text-primary">
            {FIELD_CONFIG.length} Fields
          </span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-primary/10">
          {FIELD_CONFIG.map((field) => {
            const isEditing = isCreateMode || editing.includes(field.name);

            const Icon = field.icon;

            const inputClass = `flex-1 rounded-lg border text-[13px] text-slate-700 placeholder:text-slate-400 transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 ${
              isEditing
                ? "border-primary/40 bg-white"
                : "cursor-default border-primary/15 bg-primary/5"
            }`;

            return (
              <div
                key={field.name}
                className="grid gap-2 px-4 py-3.5 transition-colors hover:bg-primary/[0.03] md:grid-cols-[210px_minmax(0,1fr)] md:gap-6 md:px-5"
              >
                {/* Label */}
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/70 to-primary text-primary-foreground shadow-sm shadow-primary/30">
                    <Icon className="size-3.5" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-semibold text-slate-800"
                    >
                      {field.label}
                    </Label>

                    <p className="text-[11px] leading-snug text-slate-500">
                      {field.description}
                    </p>
                  </div>
                </div>

                {/* Input + edit button */}
                <div className="min-w-0">
                  <div className="flex items-start gap-2">
                    {field.multiline ? (
                      <Textarea
                        id={field.name}
                        value={form[field.name]}
                        onChange={(event) =>
                          handleChange(field.name, event.target.value)
                        }
                        placeholder={field.placeholder}
                        readOnly={!isEditing}
                        maxLength={field.maxLength}
                        rows={field.name === "aboutLong" ? 6 : 3}
                        className={`scrollbar-hide resize-y ${
                          field.name === "aboutLong" ? "min-h-28" : "min-h-16"
                        } ${inputClass}`}
                      />
                    ) : (
                      <Input
                        id={field.name}
                        value={form[field.name]}
                        onChange={(event) =>
                          handleChange(field.name, event.target.value)
                        }
                        placeholder={field.placeholder}
                        readOnly={!isEditing}
                        maxLength={field.maxLength}
                        className={`h-9 ${inputClass}`}
                      />
                    )}

                    {!isCreateMode && (
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
                    )}
                  </div>

                  {/* Character Counter */}
                  <p className="mt-1 text-right text-[10px] tabular-nums text-slate-400">
                    {form[field.name].length.toLocaleString()} /{" "}
                    {field.maxLength.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Actions */}
      {(isCreateMode || isDirty) && (
        <div className="sticky bottom-3 z-10 flex flex-col justify-between gap-3 rounded-xl border border-primary/30 bg-white/95 px-4 py-2.5 shadow-xl shadow-primary/20 backdrop-blur-md sm:flex-row sm:items-center md:px-5">
          <div className="flex items-center gap-3">
            <span className="size-2.5 shrink-0 animate-pulse rounded-full bg-primary" />

            <div className="space-y-0.5">
              <p className="text-[13px] font-bold text-slate-800">
                {isCreateMode ? "Create settings" : "Unsaved changes"}
              </p>

              <p className="text-[11px] text-slate-500">
                {isCreateMode
                  ? "Add your organization's information."
                  : "Your changes haven't been saved yet."}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
            {!isCreateMode && (
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
            )}

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

              {isCreateMode ? "Create Settings" : "Save Changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
