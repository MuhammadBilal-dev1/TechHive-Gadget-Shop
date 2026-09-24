/**
 * Drop this file at: react-native-gadget-shop/src/api/reviews.ts
 * (new file — import from it in product/[slug].tsx, don't merge into
 * api.ts, so the existing file's diff stays small)
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/auth-provider";

export type ReviewWithUser = {
  id: number;
  created_at: string;
  rating: number;
  comment: string | null;
  user: string;
  users: {
    email: string;
  } | null;
};

export const getProductReviews = (productId: number) => {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review")
        .select("id, created_at, rating, comment, user, users(email)")
        .eq("product", productId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(`Error fetching reviews: ${error.message}`);

      return (data ?? []) as unknown as ReviewWithUser[];
    },
  });
};

export const getProductRatingSummary = (productId: number) => {
  return useQuery({
    queryKey: ["rating-summary", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_rating_summary")
        .select("*")
        .eq("product", productId)
        .maybeSingle();

      if (error) throw new Error(`Error fetching rating summary: ${error.message}`);

      return data ?? { average_rating: 0, review_count: 0 };
    },
  });
};

export const useMyReviewForProduct = (productId: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-review", productId, user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review")
        .select("*")
        .eq("product", productId)
        .eq("user", user.id)
        .maybeSingle();

      if (error) throw new Error(`Error fetching your review: ${error.message}`);

      return data;
    },
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    async mutationFn({
      productId,
      rating,
      comment,
    }: {
      productId: number;
      rating: number;
      comment: string;
    }) {
      const { error } = await supabase.from("review").upsert(
        {
          product: productId,
          user: user.id,
          rating,
          comment,
        },
        { onConflict: "product,user" }
      );

      if (error) throw new Error(`Error submitting review: ${error.message}`);
    },
    async onSuccess(_data, variables) {
      await queryClient.invalidateQueries({ queryKey: ["reviews", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["rating-summary", variables.productId] });
      await queryClient.invalidateQueries({ queryKey: ["my-review", variables.productId] });
    },
  });
};