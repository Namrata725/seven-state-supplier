"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Pencil,
  Plus,
  Save,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ContactSettings = {
  phones: string[];
  emails: string[];
  address: string;
  city: string;
  postalCode: string;
};

const defaultContact: ContactSettings = {
  phones: [],
  emails: [],
  address: "",
  city: "",
  postalCode: "",
};

export default function ContactTab() {
  const [contact, setContact] = useState<ContactSettings>(defaultContact);

  const [originalContact, setOriginalContact] =
    useState<ContactSettings>(defaultContact);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isDirty = JSON.stringify(contact) !== JSON.stringify(originalContact);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/public/general-settings");

      if (!response.ok) {
        throw new Error("Failed to fetch general settings");
      }

      const result = await response.json();

      const savedContact = {
        ...defaultContact,
        ...result.data?.contact,
        phones: result.data?.contact?.phones ?? [],
        emails: result.data?.contact?.emails ?? [],
      };

      setContact(savedContact);
      setOriginalContact(savedContact);
    } catch (error) {
      console.error("Contact settings fetch error:", error);
      toast.error("Unable to load contact settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateField = (
    field: keyof ContactSettings,
    value: string | string[],
  ) => {
    setContact((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateListItem = (
    field: "phones" | "emails",
    index: number,
    value: string,
  ) => {
    setContact((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addListItem = (field: "phones" | "emails") => {
    const limit = field === "phones" ? 3 : 2;

    if (contact[field].length >= limit) {
      toast.error(
        `Maximum ${limit} ${field === "phones" ? "phone numbers" : "email addresses"} allowed.`,
      );
      return;
    }

    setContact((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeListItem = (field: "phones" | "emails", index: number) => {
    setContact((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleDiscard = () => {
    setContact(originalContact);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch("/api/admin/settings/general", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact: {
            phones: contact.phones.map((phone) => phone.trim()),
            emails: contact.emails.map((email) => email.trim()),
            address: contact.address.trim(),
            city: contact.city.trim(),
            postalCode: contact.postalCode.trim(),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update contact settings");
      }

      const savedContact = {
        ...contact,
        phones: contact.phones.map((phone) => phone.trim()),
        emails: contact.emails.map((email) => email.trim()),
        address: contact.address.trim(),
        city: contact.city.trim(),
        postalCode: contact.postalCode.trim(),
      };

      setContact(savedContact);
      setOriginalContact(savedContact);
      setIsEditing(false);

      toast.success("Contact settings updated successfully.");
    } catch (error) {
      console.error("Contact settings save error:", error);

      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-2xl border border-primary/20 bg-white shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-slate-500">
            Loading contact settings...
          </p>
        </div>
      </div>
    );
  }

  const inputClass = `h-9 rounded-lg border text-[13px] text-slate-700 placeholder:text-slate-400 transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-default disabled:opacity-100 ${
    isEditing ? "border-primary/40 bg-white" : "border-primary/15 bg-primary/5"
  }`;

  const rowClass =
    "grid gap-2 px-4 py-3.5 transition-colors hover:bg-primary/[0.03] md:grid-cols-[210px_minmax(0,1fr)] md:gap-6 md:px-5";

  const chipClass =
    "flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/70 to-primary text-primary-foreground shadow-sm shadow-primary/30";

  const emptyClass =
    "rounded-lg border border-dashed border-primary/25 bg-primary/5 px-3 py-2.5 text-[12px] text-slate-500";

  const addButtonClass =
    "h-8 border-primary/30 bg-white text-[12px] text-primary hover:bg-primary/10 hover:text-primary";

  const fieldLabelClass = "text-[11px] font-medium text-slate-600";

  return (
    <div className="space-y-4 py-3">
      {/* Form Card */}
      <div className="overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-xl shadow-primary/10">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-3 border-b border-primary/15 bg-gradient-to-b from-primary/5 to-primary/10 px-4 py-3 md:px-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Contact Information
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Manage your organization&apos;s phone numbers, emails and address.
            </p>
          </div>

          {!isEditing && (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="h-8 shrink-0 rounded-lg border-primary/30 bg-white text-[12px] text-primary hover:bg-primary/10 hover:text-primary"
            >
              <Pencil className="mr-1.5 size-3.5" />
              Edit Contact
            </Button>
          )}
        </div>

        <div className="divide-y divide-primary/10">
          {/* Phone Numbers */}
          <div className={rowClass}>
            <div className="flex min-w-0 items-start gap-3">
              <div className={chipClass}>
                <Phone className="size-3.5" />
              </div>

              <div className="min-w-0 space-y-0.5">
                <h4 className="text-[13px] font-semibold text-slate-800">
                  Phone Numbers
                </h4>
                <p className="text-[11px] leading-snug text-slate-500">
                  Add up to 3 phone numbers.
                </p>
              </div>
            </div>

            <div className="min-w-0 space-y-2.5">
              {contact.phones.length === 0 && (
                <p className={emptyClass}>No phone numbers added yet.</p>
              )}

              {contact.phones.map((phone, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    {isEditing && (
                      <Label
                        htmlFor={`contact-phone-${index}`}
                        className={fieldLabelClass}
                      >
                        Phone Number {index + 1}
                      </Label>
                    )}
                    <Input
                      id={`contact-phone-${index}`}
                      value={phone}
                      disabled={!isEditing}
                      onChange={(e) =>
                        updateListItem("phones", index, e.target.value)
                      }
                      placeholder="+977 98XXXXXXXX"
                      className={inputClass}
                    />
                  </div>

                  {isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeListItem("phones", index)}
                      className="size-9 shrink-0 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                      aria-label={`Remove phone number ${index + 1}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}

              {isEditing && contact.phones.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addListItem("phones")}
                  className={addButtonClass}
                >
                  <Plus className="mr-1 size-3.5" />
                  Add Phone
                </Button>
              )}
            </div>
          </div>

          {/* Email Addresses */}
          <div className={rowClass}>
            <div className="flex min-w-0 items-start gap-3">
              <div className={chipClass}>
                <Mail className="size-3.5" />
              </div>

              <div className="min-w-0 space-y-0.5">
                <h4 className="text-[13px] font-semibold text-slate-800">
                  Email Addresses
                </h4>
                <p className="text-[11px] leading-snug text-slate-500">
                  Add up to 2 email addresses.
                </p>
              </div>
            </div>

            <div className="min-w-0 space-y-2.5">
              {contact.emails.length === 0 && (
                <p className={emptyClass}>No email addresses added yet.</p>
              )}

              {contact.emails.map((email, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    {isEditing && (
                      <Label
                        htmlFor={`contact-email-${index}`}
                        className={fieldLabelClass}
                      >
                        Email Address {index + 1}
                      </Label>
                    )}
                    <Input
                      id={`contact-email-${index}`}
                      type="email"
                      value={email}
                      disabled={!isEditing}
                      onChange={(e) =>
                        updateListItem("emails", index, e.target.value)
                      }
                      placeholder="contact@example.com"
                      className={inputClass}
                    />
                  </div>

                  {isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeListItem("emails", index)}
                      className="size-9 shrink-0 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                      aria-label={`Remove email address ${index + 1}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}

              {isEditing && contact.emails.length < 2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addListItem("emails")}
                  className={addButtonClass}
                >
                  <Plus className="mr-1 size-3.5" />
                  Add Email
                </Button>
              )}
            </div>
          </div>

          {/* Address */}
          <div className={rowClass}>
            <div className="flex min-w-0 items-start gap-3">
              <div className={chipClass}>
                <MapPin className="size-3.5" />
              </div>

              <div className="min-w-0 space-y-0.5">
                <h4 className="text-[13px] font-semibold text-slate-800">
                  Business Address
                </h4>
                <p className="text-[11px] leading-snug text-slate-500">
                  Set your organization&apos;s location details.
                </p>
              </div>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="contact-address" className={fieldLabelClass}>
                  Street Address
                </Label>
                <Input
                  id="contact-address"
                  value={contact.address}
                  disabled={!isEditing}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Enter street address"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="contact-city" className={fieldLabelClass}>
                  City
                </Label>
                <Input
                  id="contact-city"
                  value={contact.city}
                  disabled={!isEditing}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Enter city"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="contact-postal" className={fieldLabelClass}>
                  Postal Code
                </Label>
                <Input
                  id="contact-postal"
                  value={contact.postalCode}
                  disabled={!isEditing}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  placeholder="Enter postal code"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Bar */}
      {isEditing && (
        <div className="sticky bottom-3 z-10 flex flex-col justify-between gap-3 rounded-xl border border-primary/30 bg-white/95 px-4 py-2.5 shadow-xl shadow-primary/20 backdrop-blur-md sm:flex-row sm:items-center md:px-5">
          <div className="flex items-center gap-3">
            <span
              className={`size-2.5 shrink-0 rounded-full ${
                isDirty ? "animate-pulse bg-primary" : "bg-slate-300"
              }`}
            />

            <div className="space-y-0.5">
              <p className="text-[13px] font-bold text-slate-800">
                {isDirty ? "Unsaved changes" : "Editing contact"}
              </p>

              <p className="text-[11px] text-slate-500">
                {isDirty ? "You have unsaved changes." : "No changes made yet."}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleDiscard}
              disabled={saving}
              className="h-9 w-full border-primary/30 bg-white text-[13px] text-slate-600 hover:bg-primary/10 hover:text-primary sm:w-auto"
            >
              <X className="mr-2 size-4" />
              Discard
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || saving}
              className="h-9 w-full bg-primary text-[13px] text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary/90 sm:w-auto sm:min-w-36"
            >
              {saving ? (
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
