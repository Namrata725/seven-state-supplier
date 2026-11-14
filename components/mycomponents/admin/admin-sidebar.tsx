"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Boxes,
  ChevronRight,
  FileText,
  FolderKanban,
  GalleryHorizontal,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Shield,
  ShoppingCart,
  Tags,
  UserCog,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

/* ---------------------------------
   Types
--------------------------------- */

type AdminSidebarProps = {
  role: "admin" | "super_admin";
  name: string;
  email: string;
};

type MenuItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

type MenuSection = {
  title: string;
  icon: LucideIcon;
  items: MenuItem[];
};

/* ---------------------------------
   Navigation configuration
--------------------------------- */

const sections: MenuSection[] = [
  {
    title: "Catalog",
    icon: Boxes,
    items: [
      { title: "Brands", href: "/admin/brands", icon: Tags },
      { title: "Categories", href: "/admin/categories", icon: Boxes },
      { title: "Products", href: "/admin/products", icon: Package },
      {
        title: "Packages",
        href: "/admin/packages",
        icon: FolderKanban,
      },
    ],
  },
  {
    title: "Sales",
    icon: ShoppingCart,
    items: [
      {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
      },
      {
        title: "Quotation Requests",
        href: "/admin/quotation-requests",
        icon: FileText,
      },
    ],
  },
  {
    title: "Content",
    icon: GalleryHorizontal,
    items: [
      {
        title: "Galleries",
        href: "/admin/galleries",
        icon: GalleryHorizontal,
      },
    ],
  },
  {
    title: "Communication",
    icon: Mail,
    items: [
      {
        title: "Contact Messages",
        href: "/admin/contact",
        icon: Mail,
      },
    ],
  },
  {
    title: "Administration",
    icon: Shield,
    items: [
      { title: "Users", href: "/admin/users", icon: UserCog },
      {
        title: "Maintenance",
        href: "/admin/maintenance",
        icon: Wrench,
      },
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

const STORAGE_KEY = "seven-state-admin-sidebar-minimized";

/* ---------------------------------
   Helpers
--------------------------------- */

function isItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getActiveSection(
  pathname: string,
  menuSections: MenuSection[],
): MenuSection | null {
  return (
    menuSections.find((section) =>
      section.items.some((item) => isItemActive(pathname, item.href)),
    ) ?? null
  );
}

/* ---------------------------------
   Reusable components
--------------------------------- */

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground ${
        small ? "h-9 w-9" : "h-10 w-10"
      }`}
    >
      <Boxes size={small ? 19 : 21} />
    </div>
  );
}

function SidebarBrand({ onMinimize }: { onMinimize: () => void }) {
  return (
    <div className="flex h-[68px] shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-4">
      <div className="flex min-w-0 items-center gap-3">
        <BrandMark />

        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold tracking-tight text-slate-800">
            Seven State
          </p>
          <p className="text-[11px] font-medium text-slate-400">
            Suppliers Admin
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onMinimize}
        aria-label="Minimize sidebar"
        title="Minimize sidebar"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <PanelLeftClose size={17} />
      </button>
    </div>
  );
}

function MinimizeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Expand sidebar"
      title="Expand sidebar"
      className="flex h-[68px] w-full shrink-0 items-center justify-center border-b border-slate-200 text-slate-500 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
    >
      <PanelLeftOpen size={19} />
    </button>
  );
}

function DashboardLink({
  pathname,
  compact = false,
  onNavigate,
}: {
  pathname: string;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const active = pathname === "/admin";

  return (
    <Link
      href="/admin"
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={compact ? "Dashboard" : undefined}
      className={`flex items-center rounded-lg transition-colors ${
        compact ? "h-10 w-10 justify-center" : "gap-3 px-3 py-2.5 text-[13px]"
      } ${
        active
          ? "bg-primary/10 font-semibold text-primary"
          : "text-slate-600 hover:bg-slate-50 hover:text-primary"
      }`}
    >
      <LayoutDashboard size={17} />
      {!compact && <span>Project Overview</span>}
    </Link>
  );
}

function SectionIconButton({
  section,
  active,
  onClick,
}: {
  section: MenuSection;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = section.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${section.title} menu`}
      aria-current={active ? "location" : undefined}
      title={section.title}
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        active
          ? "bg-primary/10 text-primary"
          : "text-slate-500 hover:bg-white hover:text-primary"
      }`}
    >
      {active && (
        <span className="absolute -left-[9px] top-2 h-6 w-[3px] rounded-r-full bg-primary" />
      )}
      <Icon size={18} />
    </button>
  );
}

function LogoutButton({
  onClick,
  loading,
  compact = false,
}: {
  onClick: () => void;
  loading: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label="Logout"
      title={compact ? "Logout" : undefined}
      className={`flex items-center rounded-lg font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
        compact
          ? "h-10 w-10 justify-center"
          : "w-full gap-3 px-3 py-2.5 text-[12px]"
      }`}
    >
      <LogOut size={17} />
      {!compact && <span>{loading ? "Logging out..." : "Logout"}</span>}
    </button>
  );
}

function UserInfo({ name, email }: { name: string; email: string }) {
  return (
    <div className="mb-3 flex min-w-0 items-center gap-3 px-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {name.trim().charAt(0).toUpperCase() || "A"}
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-slate-700">
          {name || "Admin"}
        </p>
        <p className="truncate text-[11px] text-slate-400">{email}</p>
      </div>
    </div>
  );
}

/* ---------------------------------
   Main sidebar
--------------------------------- */

export function AdminSidebar({ role, name, email }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleSections = sections.filter(
    (section) => role === "super_admin" || section.title !== "Administration",
  );

  const routeSection = getActiveSection(pathname, visibleSections);

  const [selectedSection, setSelectedSection] = useState<MenuSection | null>(
    routeSection,
  );

  const [isMinimized, setIsMinimized] = useState(false);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const focusedSection = selectedSection;

  /* Restore minimized preference */
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      setIsMinimized(saved === "true");
    } catch {
      // Sidebar still works if browser storage is unavailable.
    } finally {
      setStorageLoaded(true);
    }
  }, []);

  /* Persist minimized preference */
  useEffect(() => {
    if (!storageLoaded) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, String(isMinimized));
    } catch {
      // Ignore storage errors.
    }
  }, [isMinimized, storageLoaded]);

  /* Keep selected section in sync with current route */
  useEffect(() => {
    setSelectedSection(routeSection);
    setMobileOpen(false);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Prevent background scrolling while mobile menu is open */
  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  function minimizeSidebar() {
    setIsMinimized(true);
  }

  function expandSidebar() {
    setIsMinimized(false);
  }

  function openSection(section: MenuSection) {
    setSelectedSection(section);
    setIsMinimized(false);
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await authClient.signOut();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
        className="fixed left-4 top-4 z-[70] flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-md lg:hidden"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Admin navigation"
        className={`
          fixed inset-y-0 left-0 z-50
          h-dvh max-h-dvh w-[300px] max-w-[85vw]
          overflow-hidden border-r border-slate-200
          bg-white text-slate-700 shadow-xl
          transition-transform duration-300
          lg:sticky lg:top-0 lg:z-auto
          lg:h-dvh lg:w-auto lg:max-w-none
          lg:shrink-0 lg:translate-x-0 lg:shadow-none
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* MINIMIZED ICON RAIL */}
        {isMinimized && (
          <div className="flex h-full w-[64px] min-w-[64px] flex-col items-center border-r border-slate-200 bg-slate-50/70">
            <MinimizeButton onClick={expandSidebar} />

            <nav
              aria-label="Main navigation"
              className="flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto py-4"
            >
              <DashboardLink
                pathname={pathname}
                compact
                onNavigate={() => setMobileOpen(false)}
              />

              {visibleSections.map((section) => (
                <SectionIconButton
                  key={section.title}
                  section={section}
                  active={focusedSection?.title === section.title}
                  onClick={() => openSection(section)}
                />
              ))}
            </nav>

            <div className="shrink-0 border-t border-slate-200 py-3">
              <LogoutButton
                onClick={handleLogout}
                loading={loggingOut}
                compact
              />
            </div>
          </div>
        )}

        {/* FULL INITIAL SIDEBAR */}
        {!isMinimized && !focusedSection && (
          <div className="flex h-full w-[260px] min-w-[260px] flex-col">
            <SidebarBrand onMinimize={minimizeSidebar} />

            <div className="shrink-0 border-b border-slate-100 p-3">
              <DashboardLink
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>

            <nav
              aria-label="Workspace navigation"
              className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2"
            >
              <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Workspace
              </p>

              {visibleSections.map((section) => {
                const Icon = section.icon;
                const active = section.items.some((item) =>
                  isItemActive(pathname, item.href),
                );

                return (
                  <div key={section.title}>
                    <button
                      type="button"
                      onClick={() => openSection(section)}
                      aria-haspopup="true"
                      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                      }`}
                    >
                      <Icon size={17} className="shrink-0" />
                      <span className="flex-1">{section.title}</span>
                      <ChevronRight
                        size={15}
                        className="text-slate-400 transition-transform group-hover:translate-x-0.5"
                      />
                    </button>

                    <div className="ml-[21px] border-l border-slate-200 pl-3">
                      {section.items.map((item) => {
                        const activeItem = isItemActive(pathname, item.href);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            aria-current={activeItem ? "page" : undefined}
                            className={`my-0.5 flex items-center rounded-md px-3 py-2 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                              activeItem
                                ? "bg-primary/10 font-semibold text-primary"
                                : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                            }`}
                          >
                            {item.title}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            <div className="shrink-0 border-t border-slate-100 p-3">
              <UserInfo name={name} email={email} />
              <LogoutButton onClick={handleLogout} loading={loggingOut} />
            </div>
          </div>
        )}

        {/* TWO-PANEL NAVIGATION */}
        {!isMinimized && focusedSection && (
          <div className="flex h-full">
            {/* Icon rail */}
            <div className="flex w-[64px] min-w-[64px] flex-col items-center border-r border-slate-200 bg-slate-50/70">
              <Link
                href="/admin"
                aria-label="Seven State dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex h-[68px] w-full shrink-0 items-center justify-center border-b border-slate-200"
              >
                <BrandMark small />
              </Link>

              <nav
                aria-label="Main navigation"
                className="flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto py-4"
              >
                <DashboardLink
                  pathname={pathname}
                  compact
                  onNavigate={() => setMobileOpen(false)}
                />

                {visibleSections.map((section) => (
                  <SectionIconButton
                    key={section.title}
                    section={section}
                    active={focusedSection.title === section.title}
                    onClick={() => openSection(section)}
                  />
                ))}
              </nav>

              <div className="shrink-0 border-t border-slate-200 py-3">
                <LogoutButton
                  onClick={handleLogout}
                  loading={loggingOut}
                  compact
                />
              </div>
            </div>

            {/* Contextual submenu */}
            <div className="flex w-[236px] min-w-[236px] flex-col bg-white">
              <div className="flex h-[68px] shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-3">
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSection(null)}
                    aria-label="Back to all sections"
                    title="Back to all sections"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <ArrowLeft size={17} />
                  </button>

                  <div className="min-w-0">
                    <h2 className="truncate text-[14px] font-semibold text-slate-700">
                      {focusedSection.title}
                    </h2>
                    <p className="text-[11px] text-slate-400">Workspace</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={minimizeSidebar}
                  aria-label="Minimize sidebar"
                  title="Minimize sidebar"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <PanelLeftClose size={17} />
                </button>
              </div>

              <nav
                aria-label={`${focusedSection.title} navigation`}
                className="min-h-0 flex-1 overflow-y-auto p-2"
              >
                <p className="px-3 pb-2 pt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {focusedSection.title}
                </p>

                {focusedSection.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`relative my-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        active
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                      }`}
                    >
                      {active && (
                        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-primary" />
                      )}

                      <Icon size={16} className="shrink-0" />
                      <span className="min-w-0 flex-1">{item.title}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="shrink-0 border-t border-slate-100 p-3">
                <UserInfo name={name} email={email} />
                <LogoutButton onClick={handleLogout} loading={loggingOut} />
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
