/**
 * Drop this file at: react-native-gadget-shop/src/app/product/[slug].tsx
 * (replaces the existing version)
 *
 * Changes:
 * - Full visual redesign: large hero image + thumbnail strip instead of
 *   a single horizontal image row
 * - Spec strip (SKU / stock status) matching the signature motif used
 *   on product cards and (soon) admin tables
 * - Sticky bottom action bar for quantity + Add to Cart
 * - Reviews section placeholder — wired up once the `reviews` table exists
 */
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "react-native-toast-notifications";
import { useCartStore } from "../../store/cart-store";
import { getProduct } from "../../api/api";
import { colors, radii, spacing, typography, getStockStatus, statusDot } from "../../theme/tokens";

const ProductDetails = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const toast = useToast();

  const { data: product, error, isLoading } = getProduct(slug);
  const { items, addItem, incrementItem, decrementItem } = useCartStore();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [hasSyncedQuantity, setHasSyncedQuantity] = useState(false);

  // Sync the local quantity once with whatever is already in the cart,
  // the first time the product finishes loading.
  React.useEffect(() => {
    if (product && !hasSyncedQuantity) {
      const cartItem = items.find((item) => item.id === product.id);
      setQuantity(cartItem ? cartItem.quantity : 0);
      setHasSyncedQuantity(true);
    }
  }, [product, items, hasSyncedQuantity]);

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.signalAmber} />;
  if (error) return <Text style={styles.errorText}>Error: {error.message}</Text>;
  if (!product) return <Redirect href={"/404"} />;

  const stockStatus = getStockStatus(product.maxQuantity);
  const sku = `GS-${String(product.id).padStart(4, "0")}`;
  const gallery = [product.heroImage, ...(product.imageUrl ?? [])];

  const increaseQuantity = () => {
    if (quantity < product.maxQuantity) {
      setQuantity((prev) => prev + 1);
      incrementItem(product.id);
    } else {
      toast.show("Cannot add more than available stock", {
        type: "warning",
        placement: "top",
        duration: 1500,
      });
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
      decrementItem(product.id);
    }
  };

  const addToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      heroImage: product.heroImage,
      price: product.price,
      quantity,
      maxQuantity: product.maxQuantity,
    });
    toast.show("Added to cart", { type: "success", placement: "top", duration: 1500 });
  };

  const totalPrice = (product.price * quantity).toFixed(2);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={styles.heroWrap}>
          <Image source={{ uri: gallery[activeImage] }} style={styles.heroImage} />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.ink} />
          </TouchableOpacity>
          {stockStatus === "outOfStock" && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
            </View>
          )}
        </View>

        {gallery.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbRow}
          >
            {gallery.map((uri, index) => (
              <TouchableOpacity key={index} onPress={() => setActiveImage(index)}>
                <Image
                  source={{ uri }}
                  style={[styles.thumb, activeImage === index && styles.thumbActive]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.info}>
          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.specStrip}>
            <View style={[styles.specDot, { backgroundColor: statusDot[stockStatus] }]} />
            <Text style={styles.specText}>
              {sku} · STOCK {product.maxQuantity} ·{" "}
              {stockStatus === "inStock"
                ? "IN STOCK"
                : stockStatus === "lowStock"
                ? "LOW STOCK"
                : "OUT OF STOCK"}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            <Text style={styles.priceLabel}>per unit</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Reviews</Text>
          <View style={styles.reviewsPlaceholder}>
            <Ionicons name="star-outline" size={20} color={colors.inkMuted} />
            <Text style={styles.reviewsPlaceholderText}>
              No reviews yet. Be the first to review this product.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={decreaseQuantity}
            disabled={quantity <= 1}
          >
            <Text style={styles.quantityButtonText}>–</Text>
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={increaseQuantity}
            disabled={quantity >= product.maxQuantity}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addToCartButton, quantity === 0 && styles.addToCartDisabled]}
          onPress={addToCart}
          disabled={quantity === 0}
        >
          <Text style={styles.addToCartText}>Add to Cart · ${totalPrice}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  errorText: {
    padding: spacing.lg,
    color: colors.danger,
  },
  heroWrap: {
    width: "100%",
    height: 320,
    backgroundColor: colors.graphiteSurface,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: spacing.xl,
    left: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    padding: spacing.sm,
  },
  outOfStockBadge: {
    position: "absolute",
    top: spacing.xl,
    right: spacing.lg,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  outOfStockText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: typography.mono.fontFamily,
    letterSpacing: 0.5,
  },
  thumbRow: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbActive: {
    borderColor: colors.signalAmber,
  },
  info: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.display.fontFamily,
    color: colors.ink,
  },
  specStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  specDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  specText: {
    fontSize: 11,
    fontFamily: typography.mono.fontFamily,
    color: colors.inkMuted,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  price: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.mono.fontFamily,
    color: colors.ink,
    fontWeight: "700",
  },
  priceLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.body.fontFamily,
    color: colors.inkMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.bodyMedium.fontFamily,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  reviewsPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  reviewsPlaceholderText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontFamily: typography.body.fontFamily,
    color: colors.inkMuted,
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    fontSize: 20,
    color: colors.ink,
    fontFamily: typography.bodyMedium.fontFamily,
  },
  quantityValue: {
    fontSize: typography.sizes.md,
    fontFamily: typography.mono.fontFamily,
    color: colors.ink,
    minWidth: 20,
    textAlign: "center",
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: colors.signalAmber,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    alignItems: "center",
  },
  addToCartDisabled: {
    opacity: 0.5,
  },
  addToCartText: {
    color: colors.ink,
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: typography.sizes.sm,
  },
});