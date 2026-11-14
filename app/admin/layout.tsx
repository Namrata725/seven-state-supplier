import { requireAdmin } from "@/lib/auth-guard";
import { AdminSidebar } from "@/components/mycomponents/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar
        role={session.user.role}
        name={session.user.name ?? ""}
        email={session.user.email ?? ""}
      />

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
