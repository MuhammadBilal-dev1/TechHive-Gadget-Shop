/**
 * Drop this file at: react-native-gadget-shop/src/app/cart.tsx
 * (replaces the existing version)
 *
 * Changes:
 * - Visual redesign: line items now show a spec-strip (unit price · qty),
 *   swipeless quantity stepper, and a proper order summary block
 *   (subtotal / shipping / total) instead of a single "Total" line.
 * - Checkout button shows a loading state while Stripe payment sheet
 *   is being set up, so the tap doesn't feel unresponsive.
 * - Empty-cart state redesigned to match the rest of the app.
 */
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useCartStore } from "../store/cart-store";
import { createOrder, createOrderItem } from "../api/api";
// @ts-ignore
import EmptyCart from "../../assets/Empty-Cart.png";
import { openStripeCheckout, setupStripePaymentSheet } from "../lib/stripe";
import { colors, radii, spacing, typography } from "../theme/tokens";

type CartItemType = {
  id: number;
  title: string;
  heroImage: string;
  price: number;
  quantity: number;
  maxQuantity: number;
};

type CartItemProps = {
  item: CartItemType;
  onRemove: (id: number) => void;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
};

const CartItem = ({ item, onDecrement, onIncrement, onRemove }: CartItemProps) => {
  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.heroImage }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.specText}>
          ${item.price.toFixed(2)} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
        </Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity onPress={() => onDecrement(item.id)} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>–</Text>
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => onIncrement(item.id)} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
};

const Cart = () => {
  const router = useRouter();
  const { items, removeItem, incrementItem, decrementItem, getTotalPrice, resetCart } =
    useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { mutateAsync: createSupabaseOrder } = createOrder();
  const { mutateAsync: createSupabaseOrderItem } = createOrderItem();

  const subtotal = parseFloat(getTotalPrice());
  const shipping = subtotal > 0 ? 0 : 0; // flat free shipping for now
  const total = subtotal + shipping;

  const handleCheckOut = async () => {
    setIsCheckingOut(true);
    try {
      await setupStripePaymentSheet(Math.floor(total * 100));
      const result = await openStripeCheckout();

      if (!result) {
        Alert.alert("Payment failed", "An error occurred while processing the payment");
        return;
      }

      await createSupabaseOrder(
        { totalPrice: total },
        {
          onSuccess: (data) => {
            createSupabaseOrderItem(
              items.map((item) => ({
                orderId: data.id,
                productId: item.id,
                quantity: item.quantity,
              })),
              {
                onSuccess: () => {
                  resetCart();
                  Alert.alert("Order placed", "Your order was created successfully.");
                  router.push("/shop/orders");
                },
              }
            );
          },
        }
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Checkout failed", "An error occurred while creating the order");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!items.length) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" />
        <Image source={EmptyCart} style={styles.emptyImage} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Browse the shop and add something you like.</Text>
        <TouchableOpacity style={styles.browseButton} onPress={() => router.push("/shop")}>
          <Text style={styles.browseButtonText}>Browse products</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onRemove={removeItem}
            onIncrement={incrementItem}
            onDecrement={decrementItem}
          />
        )}
        contentContainerStyle={styles.cartList}
      />

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>Free</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, isCheckingOut && styles.checkoutButtonDisabled]}
          onPress={handleCheckOut}
          disabled={isCheckingOut}
        >
          <Text style={styles.checkoutButtonText}>
            {isCheckingOut ? "Processing..." : "Checkout"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.xs,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.display.fontFamily,
    color: colors.ink,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.body.fontFamily,
    color: colors.inkMuted,
    textAlign: "center",
  },
  browseButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.signalAmber,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
  },
  browseButtonText: {
    color: colors.ink,
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: typography.sizes.sm,
  },
  cartList: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: radii.sm,
  },
  itemDetails: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.bodyMedium.fontFamily,
    color: colors.ink,
  },
  specText: {
    fontSize: 11,
    fontFamily: typography.mono.fontFamily,
    color: colors.inkMuted,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 4,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    fontFamily: typography.bodyMedium.fontFamily,
    color: colors.ink,
  },
  quantityValue: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.mono.fontFamily,
    color: colors.ink,
    minWidth: 16,
    textAlign: "center",
  },
  removeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeButtonText: {
    color: colors.danger,
    fontSize: 12,
    fontFamily: typography.body.fontFamily,
  },
  summary: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.inkMuted,
  },
  summaryValue: {
    fontFamily: typography.mono.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  totalValue: {
    fontFamily: typography.mono.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: "700",
    color: colors.ink,
  },
  checkoutButton: {
    marginTop: spacing.md,
    backgroundColor: colors.signalAmber,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    alignItems: "center",
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    color: colors.ink,
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: typography.sizes.md,
  },
});