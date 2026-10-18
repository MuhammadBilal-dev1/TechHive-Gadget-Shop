"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

export type Coupon = {
  id: number;
  created_at: string;
  code: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  min_order_amount: number;
  expires_at: string | null;
  is_active: boolean;
};

export const getCoupons = async (): Promise<Coupon[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupon")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Error fetching coupons: ${error.message}`);
  return data ?? [];
};

export const createCoupon = async (coupon: {
  code: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  min_order_amount: number;
  expires_at: string | null;
}) => {
  const supabase = await createClient();
  const { error } = await supabase.from("coupon").insert({
    ...coupon,
    code: coupon.code.trim().toUpperCase(),
  });

  if (error) throw new Error(`Error creating coupon: ${error.message}`);
  revalidatePath("/admin/coupons");
};

export const toggleCouponActive = async (id: number, isActive: boolean) => {
  const supabase = await createClient();
  const { error } = await supabase.from("coupon").update({ is_active: isActive }).eq("id", id);

  if (error) throw new Error(`Error updating coupon: ${error.message}`);
  revalidatePath("/admin/coupons");
};

export const deleteCoupon = async (id: number) => {
  const supabase = await createClient();
  const { error } = await supabase.from("coupon").delete().eq("id", id);

  if (error) throw new Error(`Error deleting coupon: ${error.message}`);
  revalidatePath("/admin/coupons");
};
