import { AdminLoading } from "@/components/mycomponents/admin/admin-loading";

export default function AdminPage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <p className="mt-2 text-muted-foreground">
        You have reached the admin area.
      </p>

      <AdminLoading text="Fetching users..." />
    </main>
  );
}
