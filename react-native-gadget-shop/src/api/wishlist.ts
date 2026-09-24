/**
 * Drop this file at: react-native-gadget-shop/src/api/wishlist.ts
 *
 * getWishlist() returns a Set<number> of product ids (so callers can do
 * `wishlist?.has(product.id)`), and useToggleWishlist() is a mutation
 * called as `toggleWishlist({ productId, isWishlisted })` — matches what
 * product/[slug].tsx already expects.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/auth-provider";

export const getWishlist = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select("product")
        .eq("user", user.id);

      if (error) throw new Error(`Error fetching wishlist: ${error.message}`);

      return new Set((data ?? []).map((row) => row.product)) as Set<number>;
    },
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    async mutationFn({
      productId,
      isWishlisted,
    }: {
      productId: number;
      isWishlisted: boolean;
    }) {
      if (isWishlisted) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user", user.id)
          .eq("product", productId);

        if (error)
          throw new Error(`Error removing from wishlist: ${error.message}`);
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({ user: user.id, product: productId });

        if (error)
          throw new Error(`Error adding to wishlist: ${error.message}`);
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] });
    },
  });
};
