"use client";

import { Settings2, Building2, Contact, Palette, Share2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import GeneralTab from "@/components/mycomponents/admin/general-settings/general-tab";
import ContactTab from "@/components/mycomponents/admin/general-settings/contact-tab";
import BrandingTab from "@/components/mycomponents/admin/general-settings/branding-tab";
import SocialTab from "@/components/mycomponents/admin/general-settings/social-tab";

const tabs = [
  {
    value: "general",
    label: "General",
    description: "Organization details",
    icon: Building2,
  },
  {
    value: "contact",
    label: "Contact",
    description: "Phone and address",
    icon: Contact,
  },
  {
    value: "branding",
    label: "Branding",
    description: "Logo and appearance",
    icon: Palette,
  },
  {
    value: "social",
    label: "Social",
    description: "Social media links",
    icon: Share2,
  },
];

export default function GeneralSettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-orange-50/30 md:h-[calc(100vh-4rem)] md:min-h-0 md:overflow-hidden">
      {/* Fixed Header */}
      <div className="shrink-0 px-4 pt-4 md:px-8 md:pt-8">
        <div className="relative overflow-hidden rounded-2xl border border-orange-100 bg-white p-5 shadow-sm md:p-7">
          <div className="pointer-events-none absolute -right-12 -top-16 size-56 rounded-full bg-orange-200/40 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-amber-100/50 blur-3xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 ring-1 ring-orange-200">
              <Settings2 className="size-7 text-orange-600" />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                  General Settings
                </h1>

                <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-700">
                  Store configuration
                </span>
              </div>

              <p className="max-w-xl text-sm leading-relaxed text-slate-500">
                Manage your store identity, contact information, branding and
                social media presence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Scrollable Content */}
      <Tabs
        defaultValue="general"
        className="flex min-h-0 flex-1 flex-col gap-5 px-4 pb-4 pt-6 md:px-8 md:pb-8"
      >
        {/* Fixed Tabs */}
        <TabsList className="grid h-auto w-full shrink-0 grid-cols-2 gap-3 bg-transparent p-0 md:grid-cols-4">
          {tabs.map(({ value, label, description, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="
                group flex h-auto min-w-0 items-center justify-start gap-3
                rounded-xl border border-orange-100 bg-white p-3.5 text-left
                shadow-sm transition-all duration-200
                hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md
                data-[state=active]:border-orange-500
                data-[state=active]:bg-orange-50
                data-[state=active]:shadow-md
                data-[state=active]:ring-1
                data-[state=active]:ring-orange-200
                data-[state=active]:text-orange-700
              "
            >
              <span
                className="
                  flex size-10 shrink-0 items-center justify-center
                  rounded-xl bg-orange-100 text-orange-600
                  transition-colors
                  group-data-[state=active]:bg-orange-500
                  group-data-[state=active]:text-white
                "
              >
                <Icon className="size-5" />
              </span>

              <span className="min-w-0 space-y-0.5">
                <span className="block truncate text-sm font-semibold text-slate-800">
                  {label}
                </span>

                <span className="block truncate text-[11px] font-normal text-slate-500">
                  {description}
                </span>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Scrollable Tab Content */}
        <div className="min-h-0 flex-1 md:overflow-y-auto md:overscroll-contain md:pr-2">
          <TabsContent
            value="general"
            className="mt-0 focus-visible:outline-none"
          >
            <GeneralTab />
          </TabsContent>

          <TabsContent
            value="contact"
            className="mt-0 focus-visible:outline-none"
          >
            <ContactTab />
          </TabsContent>

          <TabsContent
            value="branding"
            className="mt-0 focus-visible:outline-none"
          >
            <BrandingTab />
          </TabsContent>

          <TabsContent
            value="social"
            className="mt-0 focus-visible:outline-none"
          >
            <SocialTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
