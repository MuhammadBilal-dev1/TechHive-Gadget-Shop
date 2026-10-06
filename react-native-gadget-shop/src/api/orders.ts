/**
 * Drop this file at: react-native-gadget-shop/src/api/orders.ts
 * (new file — if you already have an order-fetching function inside
 * api/api.ts with a different name, point orders.tsx at that one instead
 * and skip this file; this is only needed if nothing like it exists yet)
 *
 * ⚠️ I can't see your actual api/api.ts right now, so table/column names
 * below are my best guess from earlier screens in this chat (cart.tsx
 * calls createOrder() with totalPrice, and admin/orders uses order_items
 * + product + status + slug). If your real table is named "orders"
 * instead of "order", or the user column isn't called "user", just
 * change those two strings — everything else stays the same.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/auth-provider";

export type OrderStatus = "Pending" | "Shipped" | "InTransit" | "Completed";

export type MyOrder = {
  id: number;
  slug: string;
  created_at: string;
  status: OrderStatus;
  totalPrice: number;
  order_items: {
    id: number;
    quantity: number;
    product: {
      id: number;
      title: string;
      heroImage: string;
      price: number;
    };
  }[];
};

export const getMyOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order")
        .select(
          "id, slug, created_at, status, totalPrice, order_items(id, quantity, product(id, title, heroImage, price))",
        )
        .eq("user", user.id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(`Error fetching orders: ${error.message}`);

      return (data ?? []) as unknown as MyOrder[];
    },
  });
};
