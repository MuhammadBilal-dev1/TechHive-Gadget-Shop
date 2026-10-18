/**
 * Drop this file at: gadget-shop-admin-panel/src/actions/customers.ts
 * (new file)
 *
 * ⚠️ Assumes: users table has id/email/created_at/role_id (from the RBAC
 * migration), roles table has name, and the orders table is named
 * "order" with columns user/totalPrice (same assumption as
 * api/orders.ts on the mobile side). Adjust the two .from() names below
 * if your actual table names differ.
 */
"use server";

import { createClient } from "@/supabase/server";

export type CustomerSummary = {
  id: string;
  email: string;
  created_at: string | null;
  order_count: number;
  total_spent: number;
};

export const getCustomers = async (): Promise<CustomerSummary[]> => {
  const supabase = await createClient();

  const { data: customers, error: customersError } = await supabase
    .from("users")
    .select("id, email, created_at, role:roles(name)")
    .order("created_at", { ascending: false });

  if (customersError) throw new Error(`Error fetching customers: ${customersError.message}`);

  // @ts-ignore - role comes back as a joined relation
  const customerOnly = (customers ?? []).filter((u) => (u.role?.name ?? "customer") === "customer");

  const { data: orders, error: ordersError } = await supabase
    .from("order")
    .select("user, totalPrice");

  if (ordersError) throw new Error(`Error fetching orders for customers: ${ordersError.message}`);

  const ordersByUser = new Map<string, { count: number; total: number }>();
  for (const order of orders ?? []) {
    const existing = ordersByUser.get(order.user) ?? { count: 0, total: 0 };
    existing.count += 1;
    existing.total += order.totalPrice ?? 0;
    ordersByUser.set(order.user, existing);
  }

  return customerOnly.map((user) => ({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    order_count: ordersByUser.get(user.id)?.count ?? 0,
    total_spent: ordersByUser.get(user.id)?.total ?? 0,
  }));
};