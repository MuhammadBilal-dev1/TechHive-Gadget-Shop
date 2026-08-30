"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

export type Role = {
  id: number;
  name: string;
  description: string | null;
};

export type UserWithRole = {
  id: string;
  email: string;
  created_at: string | null;
  role_id: number | null;
  role: Role | null;
};

/** The current signed-in user's role name (e.g. "admin", "super_admin"). */
export const getCurrentUserRole = async (): Promise<string> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  if (!user) return "customer";

  const { data, error } = await (await supabase)
    .from("users")
    .select("role:roles(name)")
    .eq("id", user.id)
    .single();

  if (error || !data) return "customer";

  // @ts-ignore - supabase types this as an array for the joined relation
  return data.role?.name ?? "customer";
};

export const getAllRoles = async (): Promise<Role[]> => {
  const supabase = createClient();
  const { data, error } = await (await supabase).from("roles").select("*").order("id");

  if (error) throw new Error(`Error fetching roles: ${error.message}`);

  return data ?? [];
};

export const getUsersWithRoles = async (): Promise<UserWithRole[]> => {
  const supabase = createClient();
  const { data, error } = await (await supabase)
    .from("users")
    .select("id, email, created_at, role_id, role:roles(id, name, description)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Error fetching users: ${error.message}`);

  // @ts-ignore - supabase types the joined relation as an array
  return data ?? [];
};

export const updateUserRole = async (userId: string, roleId: number) => {
  const supabase = createClient();
  const { error } = await (await supabase)
    .from("users")
    .update({ role_id: roleId })
    .eq("id", userId);

  if (error) throw new Error(`Error updating role: ${error.message}`);

  revalidatePath("/admin/team");
};
