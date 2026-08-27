import { Link, Stack } from 'expo-router';
import { View, StyleSheet, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "404 Error" }} />
      <View style={styles.container}>
        <Text style={{fontSize: 25, marginBottom: 15, color: '#aeafb0'}}>Oops! This screen doesn't exist.</Text>
        <Link href='/shop' style={{fontSize: 17, color: '#3d87ff'}}>Go to home screen</Link>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});