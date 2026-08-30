/**
 * Drop this file at: gadget-shop-admin-panel/src/app/auth/layout.tsx
 * (replaces the existing version)
 *
 * Same casing bug as admin/layout.tsx (data.type === "admin" could never
 * match the stored "ADMIN") — fixed by using the new role system.
 */
import { getCurrentUserRole } from "@/actions/roles";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const ADMIN_PANEL_ROLES = ["super_admin", "admin", "staff"];

export default async function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const supabase = createClient();
  const { data: authData } = await (await supabase).auth.getUser();

  if (authData?.user) {
    const role = await getCurrentUserRole();
    if (ADMIN_PANEL_ROLES.includes(role)) return redirect("/admin");
  }

  return <>{children}</>;
}
