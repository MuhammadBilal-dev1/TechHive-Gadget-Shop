/**
 * Drop this file at: react-native-gadget-shop/src/components/order-status-timeline.tsx
 * (new file)
 *
 * A horizontal step tracker: filled circles + connecting line for steps
 * already reached, hollow circle for the current/next step. Used inside
 * each order card on the Orders screen.
 */
import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { OrderStatus } from "../api/orders";
import { colors, typography } from "../theme/tokens";

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "Pending", label: "Pending" },
  { key: "Shipped", label: "Shipped" },
  { key: "InTransit", label: "In Transit" },
  { key: "Completed", label: "Delivered" },
];

export const OrderStatusTimeline = ({ status }: { status: OrderStatus }) => {
  const currentIndex = STEPS.findIndex((step) => step.key === status);

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isReached = index <= currentIndex;
        const isLast = index === STEPS.length - 1;

        return (
          <View key={step.key} style={styles.stepWrap}>
            <View style={styles.stepColumn}>
              <View style={[styles.dot, isReached && styles.dotReached]} />
              {!isLast && (
                <View style={[styles.line, index < currentIndex && styles.lineReached]} />
              )}
            </View>
            <Text
              style={[styles.label, isReached && styles.labelReached]}
              numberOfLines={1}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepWrap: {
    flex: 1,
    alignItems: "center",
  },
  stepColumn: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.borderLight,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  dotReached: {
    backgroundColor: colors.signalAmber,
    borderColor: colors.signalAmber,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.borderLight,
  },
  lineReached: {
    backgroundColor: colors.signalAmber,
  },
  label: {
    fontSize: 9,
    fontFamily: typography.mono.fontFamily,
    color: colors.inkMuted,
    marginTop: 4,
    textAlign: "center",
  },
  labelReached: {
    color: colors.ink,
    fontFamily: typography.bodyMedium.fontFamily,
  },
});