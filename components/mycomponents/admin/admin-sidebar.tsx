"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  FileText,
  FolderKanban,
  GalleryHorizontal,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  UserCog,
  Wrench,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

type AdminSidebarProps = {
  role: "admin" | "super_admin";
  name: string;
  email: string;
};

const commonMenuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Brands",
    href: "/admin/brands",
    icon: Tags,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Boxes,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Packages",
    href: "/admin/packages",
    icon: FolderKanban,
  },
  {
    title: "Galleries",
    href: "/admin/galleries",
    icon: GalleryHorizontal,
  },
  {
    title: "Contact",
    href: "/admin/contact",
    icon: Mail,
  },
];

const superAdminMenuItems = [
  {
    title: "User Management",
    href: "/admin/users",
    icon: UserCog,
  },
  {
    title: "Quotation Requests",
    href: "/admin/quotation-requests",
    icon: FileText,
  },
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
];

export function AdminSidebar({ role, name, email }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems =
    role === "super_admin"
      ? [...commonMenuItems, ...superAdminMenuItems]
      : commonMenuItems;

  async function handleLogout() {
    await authClient.signOut();

    window.location.href = "/login";
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-primary/40 bg-background">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-primary/40 px-5">
        <div>
          <h1 className="text-lg font-bold text-primary">
            Seven State Suppliers
          </h1>

          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-primary"
                }`}
              />

              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Information */}
      <div className="shrink-0 border-t border-primary/40 p-4">
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-4">
          {/* Name & Email */}
          <div className="mb-3 min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {name}
            </p>

            <p className="mt-1 truncate text-xs text-muted-foreground">
              {email}
            </p>
          </div>

          {/* Role */}
          <div className="mb-3">
            <span className="inline-flex rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {role === "super_admin" ? "Super Admin" : "Admin"}
            </span>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />

            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
