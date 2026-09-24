/**
 * Drop this file at: react-native-gadget-shop/src/components/reviews-section.tsx
 *
 * Replaces the static "no reviews yet" placeholder in product/[slug].tsx.
 * Shows the average rating + count, the list of existing reviews, and a
 * tappable star form to submit (or edit) your own review.
 */
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "react-native-toast-notifications";
import {
  getProductRatingSummary,
  getProductReviews,
  useMyReviewForProduct,
  useSubmitReview,
} from "../api/reviews";
import { colors, radii, spacing, typography } from "../theme/tokens";

const Stars = ({
  value,
  size = 16,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (rating: number) => void;
}) => {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          disabled={!onChange}
          onPress={() => onChange?.(star)}
          hitSlop={6}
        >
          <Ionicons
            name={star <= value ? "star" : "star-outline"}
            size={size}
            color={colors.signalAmber}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const ReviewsSection = ({ productId }: { productId: number }) => {
  const toast = useToast();
  const { data: summary } = getProductRatingSummary(productId);
  const { data: reviews } = getProductReviews(productId);
  const { data: myReview } = useMyReviewForProduct(productId);
  const { mutateAsync: submitReview, isPending } = useSubmitReview();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment ?? "");
    }
  }, [myReview]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.show("Pick a star rating first", { type: "warning", placement: "top" });
      return;
    }
    try {
      await submitReview({ productId, rating, comment });
      toast.show(myReview ? "Review updated" : "Review submitted", {
        type: "success",
        placement: "top",
      });
    } catch (error) {
      toast.show("Could not submit review", { type: "danger", placement: "top" });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <Text style={styles.averageValue}>{summary?.average_rating ?? 0}</Text>
        <View>
          <Stars value={Math.round(summary?.average_rating ?? 0)} />
          <Text style={styles.reviewCount}>
            {summary?.review_count ?? 0} review{summary?.review_count === 1 ? "" : "s"}
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.formLabel}>
          {myReview ? "Edit your review" : "Write a review"}
        </Text>
        <Stars value={rating} size={26} onChange={setRating} />
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="What did you think? (optional)"
          placeholderTextColor={colors.inkMuted}
          multiline
          style={styles.commentInput}
        />
        <TouchableOpacity
          style={[styles.submitButton, isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isPending}
        >
          <Text style={styles.submitButtonText}>
            {isPending ? "Saving..." : myReview ? "Update review" : "Submit review"}
          </Text>
        </TouchableOpacity>
      </View>

      {reviews && reviews.length > 0 ? (
        <View style={styles.list}>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor} numberOfLines={1}>
                  {review.users?.email ?? "Anonymous"}
                </Text>
                <Stars value={review.rating} size={13} />
              </View>
              {review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No reviews yet — be the first.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  averageValue: {
    fontSize: 36,
    fontFamily: typography.mono.fontFamily,
    color: colors.ink,
    fontWeight: "700",
  },
  reviewCount: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.body.fontFamily,
    color: colors.inkMuted,
    marginTop: 2,
  },
  form: {
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  formLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.bodyMedium.fontFamily,
    color: colors.ink,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.sm,
    padding: spacing.sm,
    minHeight: 70,
    textAlignVertical: "top",
    fontFamily: typography.body.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  submitButton: {
    backgroundColor: colors.signalAmber,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.ink,
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: typography.sizes.sm,
  },
  list: {
    gap: spacing.sm,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.sm,
    gap: 4,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewAuthor: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.bodyMedium.fontFamily,
    color: colors.ink,
    maxWidth: "60%",
  },
  reviewComment: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.body.fontFamily,
    color: colors.inkMuted,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.body.fontFamily,
    color: colors.inkMuted,
  },
});