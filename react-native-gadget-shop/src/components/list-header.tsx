/**
 * Redesigned home screen header.
 * Drop this file at: react-native-gadget-shop/src/components/list-header.tsx
 * (replaces the existing version)
 *
 * Changes from the old version:
 * - Added a working search bar (calls onSearchChange, wired up in shop/index.tsx)
 * - Cart badge redesigned as a spec-strip pill (matches the signature motif)
 * - Hero banner restyled with the amber/graphite identity instead of plain green
 * - Categories are now pill chips with a subtle border instead of bare circles
 */
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { Link } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
// @ts-ignore
import heroImg from '../../assets/images/hero.png';
import { useCartStore } from '../store/cart-store';
import { supabase } from '../lib/supabase';
import { Tables } from '../types/database.types';
import { colors, radii, spacing, typography } from '../theme/tokens';

type Props = {
  categories: Tables<'category'>[];
  onSearchChange?: (query: string) => void;
};

const ListHeader = ({ categories, onSearchChange }: Props) => {
  const { getItemCount } = useCartStore();
  const [query, setQuery] = useState('');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSearch = (text: string) => {
    setQuery(text);
    onSearchChange?.(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <Image
            source={{
              uri: 'https://tse2.mm.bing.net/th/id/OIP.Zvs5IHgOO5kip7A32UwZJgHaHa?pid=Api&P=0&h=220',
            }}
            style={styles.avatar}
          />
          <Text style={styles.greeting}>Hello codewithlari</Text>
        </View>

        <View style={styles.actions}>
          <Link href="/cart" asChild>
            <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}>
              <FontAwesome name="shopping-cart" size={20} color={colors.ink} />
              {getItemCount() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getItemCount()}</Text>
                </View>
              )}
            </Pressable>
          </Link>
          <TouchableOpacity onPress={handleSignOut} style={styles.iconButton}>
            <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.inkMuted} />
        <TextInput
          value={query}
          onChangeText={handleSearch}
          placeholder="Search gadgets, brands, categories..."
          placeholderTextColor={colors.inkMuted}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.hero}>
        <Image source={heroImg} style={styles.heroImage} />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroEyebrow}>NEW DROP</Text>
          <Text style={styles.heroTitle}>25% off select gadgets</Text>
          <TouchableOpacity style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Shop the sale</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <Link asChild href={`categories/${item.slug}`}>
              <Pressable style={({ pressed }) => [styles.category, pressed && styles.categoryPressed]}>
                <Image source={{ uri: item.imageUrl }} style={styles.categoryImage} />
                <Text style={styles.categoryText} numberOfLines={1}>
                  {item.name}
                </Text>
              </Pressable>
            </Link>
          )}
          keyExtractor={(item) => item.slug}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm }}
        />
      </View>

      <Text style={styles.sectionTitle}>All products</Text>
    </View>
  );
};

export default ListHeader;

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
  },
  greeting: {
    fontSize: typography.sizes.md,
    fontFamily: typography.bodyMedium.fontFamily,
    color: colors.ink,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
    padding: spacing.sm,
  },
  iconButtonPressed: {
    opacity: 0.6,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.signalAmber,
    borderRadius: radii.pill,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: colors.ink,
    fontSize: 10,
    fontFamily: typography.mono.fontFamily,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontFamily: typography.body.fontFamily,
    color: colors.ink,
  },
  hero: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    height: 190,
    backgroundColor: colors.graphiteInk,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    resizeMode: 'cover',
    opacity: 0.55,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    gap: 4,
  },
  heroEyebrow: {
    color: colors.signalAmber,
    fontFamily: typography.mono.fontFamily,
    fontSize: 11,
    letterSpacing: 1,
  },
  heroTitle: {
    color: colors.textOnDark,
    fontFamily: typography.display.fontFamily,
    fontSize: typography.sizes.xl,
    maxWidth: '80%',
  },
  heroButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.signalAmber,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
  },
  heroButtonText: {
    color: colors.ink,
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: typography.sizes.sm,
  },
  categoriesSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.display.fontFamily,
    color: colors.ink,
  },
  category: {
    width: 84,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  categoryPressed: {
    opacity: 0.7,
  },
  categoryImage: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: typography.body.fontFamily,
    color: colors.ink,
    textAlign: 'center',
  },
});