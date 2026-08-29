/**
 * Drop this file at: react-native-gadget-shop/src/app/shop/index.tsx
 * (replaces the existing version)
 *
 * Change: search bar in ListHeader now actually filters the product grid
 * by title (client-side, case-insensitive). Also swapped ActivityIndicator
 * for a plain empty state message once results are wired up.
 */
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useMemo, useState } from "react";
import { ProductListItem } from "../../components/product-list-item";
import ListHeader from "../../components/list-header";
import { getProductsAndCategories } from "../../api/api";
import { colors, spacing, typography } from "../../theme/tokens";

const Home = () => {
  const { data, error, isLoading } = getProductsAndCategories();
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    if (!search.trim()) return data.products;
    return data.products.filter((product) =>
      product.title.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [data?.products, search]);

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.signalAmber} />;

  if (error || !data) {
    return <Text>Error {error?.message || "An error occurred"}</Text>;
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.paper,
        paddingTop: StatusBar.currentHeight || 0,
        marginBottom: 0,
      }}
    >
      <StatusBar barStyle={"dark-content"} backgroundColor={colors.paper} />
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => <ProductListItem product={item} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        ListHeaderComponent={
          <ListHeader categories={data.categories} onSearchChange={setSearch} />
        }
        ListEmptyComponent={
          search.trim() ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No results for "{search}"</Text>
              <Text style={styles.emptySubtitle}>Try a different search term.</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.flatListContent}
        columnWrapperStyle={styles.flatListColumn}
        style={styles.list}
      />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  flatListColumn: {
    justifyContent: "space-between",
  },
  emptyState: {
    paddingTop: spacing.xxl,
    alignItems: "center",
    gap: spacing.xs,
  },
  emptyTitle: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  emptySubtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.inkMuted,
  },
});