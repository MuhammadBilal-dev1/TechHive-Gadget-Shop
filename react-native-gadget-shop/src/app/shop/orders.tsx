/**
 * Drop this file at: react-native-gadget-shop/src/app/shop/orders.tsx
 * (replaces the existing version — if your Orders tab file lives at a
 * different path in your project, like src/app/orders.tsx, just put
 * this content there instead; keep the file name you already have)
 *
 * Changes:
 * - Each order is now a card: order id/date spec-strip, a colored
 *   status badge, a horizontal preview strip of item thumbnails, and
 *   the total — instead of a plain list row.
 * - Status badge color matches the order lifecycle (amber → cyan →
 *   green) so you can scan order state at a glance.
 * - Empty state redesigned to match the rest of the app (was blank
 *   before, or a bare "no orders" text).
 */
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator } from "react-native";
import { getMyOrders, MyOrder, OrderStatus } from "../../api/orders";
import { colors, radii, spacing, typography } from "../../theme/tokens";

const STATUS_STYLE: Record<OrderStatus, { bg: string; fg: string; label: string }> = {
  Pending: { bg: "#FBEAD1", fg: colors.signalAmberDim, label: "Pending" },
  Shipped: { bg: "#DDF1FB", fg: "#1D6E8F", label: "Shipped" },
  InTransit: { bg: "#DDF1FB", fg: "#1D6E8F", label: "In Transit" },
  Completed: { bg: "#DBF5E8", fg: "#1E7A50", label: "Completed" },
};

const OrderCard = ({ order }: { order: MyOrder }) => {
  const statusStyle = STATUS_STYLE[order.status] ?? STATUS_STYLE.Pending;
  const itemCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderTitle}>Order #{order.id}</Text>
          <Text style={styles.specText}>
            {order.slug} · {new Date(order.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusBadgeText, { color: statusStyle.fg }]}>
            {statusStyle.label}
          </Text>
        </View>
      </View>

      <FlatList
        data={order.order_items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.itemRow}
        renderItem={({ item }) => (
          <Image source={{ uri: item.product.heroImage }} style={styles.itemThumb} />
        )}
      />

      <View style={styles.cardFooter}>
        <Text style={styles.itemCountText}>
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </Text>
        <Text style={styles.totalText}>${order.totalPrice.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const Orders = () => {
  const { data: orders, isLoading, error } = getMyOrders();
  const router = useRouter();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.signalAmber} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Could not load your orders.</Text>
      </SafeAreaView>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>
          Orders you place will show up here with their status.
        </Text>
        <TouchableOpacity style={styles.browseButton} onPress={() => router.push("/shop")}>
          <Text style={styles.browseButtonText}>Start shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={orders}
        keyExtractor={(order) => order.id.toString()}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.screenTitle}>Your orders</Text>}
      />
    </SafeAreaView>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.xs,
  },
  errorText: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.danger,
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
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  screenTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.display.fontFamily,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.bodyMedium.fontFamily,
    color: colors.ink,
  },
  specText: {
    fontSize: 11,
    fontFamily: typography.mono.fontFamily,
    color: colors.inkMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: typography.bodyMedium.fontFamily,
  },
  itemRow: {
    gap: spacing.xs,
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.graphiteSurface,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  itemCountText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.body.fontFamily,
    color: colors.inkMuted,
  },
  totalText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.mono.fontFamily,
    fontWeight: "700",
    color: colors.ink,
  },
});