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
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-8 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Contact Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage your organization's phone numbers, emails and address.
          </p>
        </div>

        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Contact
          </Button>
        )}
      </div>

      {/* Phone Numbers */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <Phone className="h-5 w-5" />
            </div>

            <div>
              <h3 className="font-medium text-slate-800">Phone Numbers</h3>
              <p className="text-xs text-slate-500">
                Add up to 3 phone numbers.
              </p>
            </div>
          </div>

          {isEditing && contact.phones.length < 3 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addListItem("phones")}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Phone
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {contact.phones.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-400">
              No phone numbers added yet.
            </p>
          )}

          {contact.phones.map((phone, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 space-y-1.5">
                {isEditing && <Label>Phone Number {index + 1}</Label>}
                <Input
                  value={phone}
                  disabled={!isEditing}
                  onChange={(e) =>
                    updateListItem("phones", index, e.target.value)
                  }
                  placeholder="+977 98XXXXXXXX"
                  className="border-slate-200 focus-visible:ring-orange-400"
                />
              </div>

              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeListItem("phones", index)}
                  className="mt-5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove phone number ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Email Addresses */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <Mail className="h-5 w-5" />
            </div>

            <div>
              <h3 className="font-medium text-slate-800">Email Addresses</h3>
              <p className="text-xs text-slate-500">
                Add up to 2 email addresses.
              </p>
            </div>
          </div>

          {isEditing && contact.emails.length < 2 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addListItem("emails")}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Email
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {contact.emails.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-400">
              No email addresses added yet.
            </p>
          )}

          {contact.emails.map((email, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 space-y-1.5">
                {isEditing && <Label>Email Address {index + 1}</Label>}
                <Input
                  type="email"
                  value={email}
                  disabled={!isEditing}
                  onChange={(e) =>
                    updateListItem("emails", index, e.target.value)
                  }
                  placeholder="contact@example.com"
                  className="border-slate-200 focus-visible:ring-orange-400"
                />
              </div>

              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeListItem("emails", index)}
                  className="mt-5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove email address ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Address */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
            <MapPin className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-medium text-slate-800">Business Address</h3>
            <p className="text-xs text-slate-500">
              Set your organization's location details.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Street Address</Label>
            <Input
              value={contact.address}
              disabled={!isEditing}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Enter street address"
              className="border-slate-200 focus-visible:ring-orange-400"
            />
          </div>

          <div className="space-y-2">
            <Label>City</Label>
            <Input
              value={contact.city}
              disabled={!isEditing}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="Enter city"
              className="border-slate-200 focus-visible:ring-orange-400"
            />
          </div>

          <div className="space-y-2">
            <Label>Postal Code</Label>
            <Input
              value={contact.postalCode}
              disabled={!isEditing}
              onChange={(e) => updateField("postalCode", e.target.value)}
              placeholder="Enter postal code"
              className="border-slate-200 focus-visible:ring-orange-400"
            />
          </div>
        </div>
      </section>

      {/* Save Bar */}
      {isEditing && (
        <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {isDirty ? "You have unsaved changes." : "No changes made yet."}
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleDiscard}
              disabled={saving}
            >
              <X className="mr-2 h-4 w-4" />
              Discard
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || saving}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
