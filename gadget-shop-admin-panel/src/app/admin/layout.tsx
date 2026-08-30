/**
 * Drop this file at: gadget-shop-admin-panel/src/app/admin/layout.tsx
 * (replaces the existing version)
 *
 * Bug fixes from the old version:
 * 1. The old check compared `data.type === ADMIN` where ADMIN = "admin"
 *    (lowercase) but the database stores 'ADMIN' (uppercase) - this
 *    comparison could never be true, so the check silently did nothing.
 * 2. Even ignoring the casing bug, the condition was inverted: it
 *    redirected the user to "/" when they WERE an admin, instead of
 *    redirecting non-admins away. Anyone signed in could reach /admin.
 *
 * This version uses the new role_id/roles system: only 'super_admin',
 * 'admin', and 'staff' roles may enter the admin panel at all. Staff is
 * intentionally allowed in (they can manage orders); more granular
 * per-page restriction happens where relevant (e.g. Team page).
 */
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { RenderMounted } from "@/components/render-mounted";
import { getCurrentUserRole } from "@/actions/roles";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const ADMIN_PANEL_ROLES = ["super_admin", "admin", "staff"];

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const supabase = createClient();
  const { data: authData } = await (await supabase).auth.getUser();

  if (!authData?.user) return redirect("/auth");

  const role = await getCurrentUserRole();

  if (!ADMIN_PANEL_ROLES.includes(role)) {
    return redirect("/");
  }

  return (
    <RenderMounted>
      <Header role={role} />
      <main className="min-h-[calc(100svh-128px)] py-3">{children}</main>
      <Footer />
    </RenderMounted>
  );
}
