/**
 * Drop this file at: gadget-shop-admin-panel/src/app/admin/team/page.tsx
 *
 * New page — didn't exist before. Only super_admin can view/use it;
 * everyone else who reaches /admin/team (e.g. by typing the URL) sees a
 * plain access-denied message rather than a broken page.
 */
import { getAllRoles, getCurrentUserRole, getUsersWithRoles } from "@/actions/roles";
import TeamPageComponent from "@/app/admin/team/page-component";

export default async function TeamPage() {
  const role = await getCurrentUserRole();

  if (role !== "super_admin") {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-muted-foreground">
          Only super admins can manage team roles.
        </p>
      </div>
    );
  }

  const [users, roles] = await Promise.all([getUsersWithRoles(), getAllRoles()]);

  return <TeamPageComponent users={users} roles={roles} />;
}
