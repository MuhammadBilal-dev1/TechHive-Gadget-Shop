/**
 * Drop this file at: gadget-shop-admin-panel/src/app/admin/team/page-component.tsx
 *
 * New file. Lets a super_admin see every user and change their role via
 * a dropdown. Role changes call updateUserRole, which is itself backed
 * by an RLS policy that only allows super_admin to succeed server-side
 * too - this UI gate is a convenience, not the real security boundary.
 */
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role, UserWithRole, updateUserRole } from "@/actions/roles";

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  super_admin: "default",
  admin: "secondary",
  staff: "outline",
  customer: "outline",
};

export default function TeamPageComponent({
  users,
  roles,
}: {
  users: UserWithRole[];
  roles: Role[];
}) {
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, roleId: string) => {
    setPendingUserId(userId);
    try {
      await updateUserRole(userId, Number(roleId));
      toast.success("Role updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Team &amp; Roles</h1>

      <Card>
        <CardHeader>
          <CardTitle>{users.length} accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Current role</TableHead>
                <TableHead>Change role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <span className="spec-strip">
                      {user.created_at ? format(new Date(user.created_at), "MMM dd, yyyy") : "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant[user.role?.name ?? "customer"]}>
                      {user.role?.name ?? "customer"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={user.role_id?.toString()}
                      disabled={pendingUserId === user.id}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger className="w-[160px]" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
