import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { StyleSheet } from "react-native";

import { IntroSlider } from "@/components/intro/IntroSlider";
import { ThemedView } from "@/components/ThemedView";

export default function IntroScreen() {
  return (
    <>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <IntroSlider />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
