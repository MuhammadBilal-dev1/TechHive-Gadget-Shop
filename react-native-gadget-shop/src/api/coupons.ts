/**
 * Drop this file at: react-native-gadget-shop/src/api/coupons.ts
 * (new file)
 */
import { useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export type AppliedCoupon = {
  id: number;
  code: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  min_order_amount: number;
};

/**
 * Validates a coupon code against the current subtotal and returns the
 * coupon row if it's usable, or throws a human-readable error if not
 * (not found, inactive, expired, or subtotal below the minimum).
 */
export const useValidateCoupon = () => {
  return useMutation({
    async mutationFn({
      code,
      subtotal,
    }: {
      code: string;
      subtotal: number;
    }): Promise<AppliedCoupon> {
      const { data, error } = await supabase
        .from("coupon")
        .select("id, code, discount_type, discount_value, min_order_amount, is_active, expires_at")
        .eq("code", code.trim().toUpperCase())
        .maybeSingle();

      if (error) throw new Error("Could not check that code right now");
      if (!data) throw new Error("That coupon code doesn't exist");
      if (!data.is_active) throw new Error("That coupon is no longer active");
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error("That coupon has expired");
      }
      if (subtotal < data.min_order_amount) {
        throw new Error(`This coupon needs a minimum order of $${data.min_order_amount.toFixed(2)}`);
      }

      return {
        id: data.id,
        code: data.code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_order_amount: data.min_order_amount,
      };
    },
  });
};

export function calculateDiscount(coupon: AppliedCoupon, subtotal: number): number {
  if (coupon.discount_type === "percentage") {
    return subtotal * (coupon.discount_value / 100);
  }
  return Math.min(coupon.discount_value, subtotal);
}