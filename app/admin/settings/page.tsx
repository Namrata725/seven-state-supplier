"use client";

import { useState } from "react";
import { Building2, Contact, Palette, Share2 } from "lucide-react";

import { cn } from "@/lib/utils";
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
    heading: "Organization Details",
    subheading:
      "Manage your organization name, slogan and the descriptions shown across your store.",
  },
  {
    value: "contact",
    label: "Contact",
    description: "Phone and address",
    icon: Contact,
    heading: "Contact Information",
    subheading:
      "Manage your phone numbers, email addresses and business address.",
  },
  {
    value: "branding",
    label: "Branding",
    description: "Logo and appearance",
    icon: Palette,
    heading: "Branding & Appearance",
    subheading: "Upload and manage your website logo and browser favicon.",
  },
  {
    value: "social",
    label: "Social",
    description: "Social media links",
    icon: Share2,
    heading: "Social Media Links",
    subheading: "Connect your website and social media profiles.",
  },
];

export default function GeneralSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const current = tabs.find((tab) => tab.value === activeTab) ?? tabs[0];
  const CurrentIcon = current.icon;

  return (
    <div className="flex min-h-dvh flex-col bg-primary/5 md:h-dvh md:min-h-0 md:overflow-hidden">
      {/* Fixed Header (title changes with the active tab) */}
      <div className="shrink-0 px-4 pt-4 md:px-6 md:pt-5">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/75 p-3 shadow-lg shadow-primary/25 md:p-4">
          {/* Decorative circles */}
          <span className="pointer-events-none absolute -right-10 -top-24 size-64 rounded-full bg-white/10" />
          <span className="pointer-events-none absolute -bottom-20 left-[44%] size-40 rounded-full bg-white/10" />

          <div className="relative flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 md:size-11">
              <CurrentIcon className="size-5 text-primary-foreground md:size-6" />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-primary-foreground md:text-xl">
                  {current.heading}
                </h1>

                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground ring-1 ring-white/30">
                  Store configuration
                </span>
              </div>

              <p className="max-w-xl text-xs font-medium leading-relaxed text-primary-foreground md:text-[13px]">
                {current.subheading}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Scrollable Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4 pt-4 md:px-6 md:pb-5"
      >
        {/* Fixed Tabs: active = primary bg + white text, others = white bg + gray text.
            Styling is driven by our own activeTab state (not data-attributes),
            so it works with any Tabs implementation. */}
        <TabsList className="grid h-auto w-full shrink-0 grid-cols-2 gap-2.5 bg-transparent p-0 md:grid-cols-4">
          {tabs.map(({ value, label, description, icon: Icon }) => {
            const isActive = activeTab === value;

            return (
              <TabsTrigger
                key={value}
                value={value}
                className={cn(
                  "flex h-auto min-w-0 items-center justify-start gap-2.5 rounded-lg border px-3 py-2.5 text-left shadow-sm transition-all duration-200",
                  isActive
                    ? "-translate-y-0.5 !border-primary !bg-primary !text-primary-foreground shadow-lg shadow-primary/30"
                    : "border-primary/20 bg-white hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "bg-white/20 text-primary-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="size-4" />
                </span>

                <span className="min-w-0 space-y-0.5">
                  <span
                    className={cn(
                      "block truncate text-[13px] font-semibold",
                      isActive ? "text-primary-foreground" : "text-slate-600",
                    )}
                  >
                    {label}
                  </span>

                  <span
                    className={cn(
                      "block truncate text-[10px] font-normal",
                      isActive
                        ? "text-primary-foreground/85"
                        : "text-slate-500",
                    )}
                  >
                    {description}
                  </span>
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Scrollable Tab Content */}
        <div className="tab-content-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pt-2 md:px-1 md:pb-1">
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
