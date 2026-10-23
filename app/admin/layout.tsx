import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/mycomponents/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role !== "admin" && role !== "super_admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar
        role={role}
        name={session.user.name ?? ""}
        email={session.user.email ?? ""}
      />

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
