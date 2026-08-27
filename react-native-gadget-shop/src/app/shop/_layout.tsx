import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useAuth } from "../../providers/auth-provider";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: String;
}) {
  return <FontAwesome size={24} {...props} style={{ color: "#1BC464" }} />
}

const TabsaLayout = () => {
  const {session, mounting} = useAuth()

  if (mounting) return <ActivityIndicator/>
  if (!session) return <Redirect href='/auth' />
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#1BC464",
          tabBarInactiveTintColor: "gray",
          tabBarLabelStyle: { fontSize: 16 },
          tabBarStyle: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ 
            title: 'shop', 
            tabBarIcon(props){
                return <TabBarIcon {...props} name="shopping-cart"/>
            }
         }} />
        <Tabs.Screen name="orders" options={{
            title: 'Orders',
            tabBarIcon(props){
                return <TabBarIcon {...props} name="book" />
            }
            
        }} />
      </Tabs>
    </SafeAreaView>
  );
};

export default TabsaLayout;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // paddingTop: StatusBar.currentHeight || 0,
    marginBottom: 0,
  },
});
