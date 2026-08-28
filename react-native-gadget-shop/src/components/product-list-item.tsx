/**
 * Redesigned product card.
 * Drop this file at: react-native-gadget-shop/src/components/product-list-item.tsx
 * (replaces the existing basic version)
 *
 * Signature "spec strip": a monospace SKU/stock row with a status LED,
 * echoing a real gadget's spec sheet. Reused later on order rows and
 * admin dashboard cards for a consistent thread across the app.
 */
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import { Tables } from '../types/database.types';
import { colors, typography, spacing, radii, statusDot, getStockStatus } from '../theme/tokens';

export const ProductListItem = ({
  product,
}: {
  product: Tables<'product'>;
}) => {
  const stockStatus = getStockStatus(product.maxQuantity);
  const sku = `GS-${String(product.id).padStart(4, '0')}`;

  return (
    <Link asChild href={`/product/${product.slug}`}>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.heroImage }} style={styles.image} />
          {stockStatus === 'outOfStock' && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {product.title}
          </Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>

          {/* Spec strip — signature element */}
          <View style={styles.specStrip}>
            <View style={[styles.specDot, { backgroundColor: statusDot[stockStatus] }]} />
            <Text style={styles.specText}>
              {sku} · STOCK {product.maxQuantity}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.white,
    marginVertical: spacing.sm,
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardPressed: {
    opacity: 0.85,
  },
  imageWrap: {
    width: '100%',
    height: 150,
    backgroundColor: '#F0EFEA',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  outOfStockText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: typography.mono.fontFamily,
    letterSpacing: 0.5,
  },
  body: {
    padding: spacing.md,
    gap: 4,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.bodyMedium.fontFamily,
    color: colors.ink,
  },
  price: {
    fontSize: typography.sizes.md,
    fontFamily: typography.mono.fontFamily,
    color: colors.ink,
    fontWeight: '700',
  },
  specStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  specDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  specText: {
    fontSize: 10,
    fontFamily: typography.mono.fontFamily,
    color: colors.inkMuted,
  },
});
