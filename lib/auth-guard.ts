
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type AdminRole = "admin" | "super_admin";

export async function requireAdmin() {
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

  return {
    ...session,
    user: {
      ...session.user,
      role: role as AdminRole,
    },
  };
}
