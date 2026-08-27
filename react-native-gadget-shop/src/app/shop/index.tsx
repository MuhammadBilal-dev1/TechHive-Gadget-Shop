import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PRODUCTS } from "../../../assets/products";
import { ProductListItem } from "../../components/product-list-item";
import ListHeader from "../../components/list-header";
import { getProductsAndCategories } from "../../api/api";

const Home = () => {
  const { data, error, isLoading } = getProductsAndCategories();

  if (isLoading) return <ActivityIndicator />;

  if (error || !data) {
    return <Text>Error {error?.message || "An error occurred"}</Text>;
  }

  // console.log(data);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: StatusBar.currentHeight || 0,
        marginBottom: 0,
      }}
    >
      <StatusBar barStyle={"dark-content"} backgroundColor={"white"} />
      <View>
        <FlatList
          data={data.products}
          renderItem={({ item }) => <ProductListItem product={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          ListHeaderComponent={<ListHeader categories={data.categories} />}
          contentContainerStyle={styles.flatListContent}
          columnWrapperStyle={styles.flatListColumn}
          style={{ paddingHorizontal: 10, paddingVertical: 5 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  flatListContent: {
    paddingBottom: 20,
  },
  flatListColumn: {
    justifyContent: "space-between",
  },
});
