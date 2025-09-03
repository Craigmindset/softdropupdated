import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="SplashScreen" options={{ headerShown: false }} />
        <Stack.Screen
          name="IntroScreen"
          options={{ headerShown: false, statusBarStyle: "dark" }}
        />
        <Stack.Screen name="ScreenDivision" options={{ headerShown: false }} />
        <Stack.Screen name="Carrier/Login" options={{ headerShown: false }} />
        <Stack.Screen
          name="Carrier/Registration"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Carrier/IDSelection"
          options={{ headerShown: false }}
        />
        ;
        <Stack.Screen
          name="Carrier/EnterOtp"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Carrier/Success" options={{ headerShown: false }} />
        <Stack.Screen
          name="Carrier/CreatePassword"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Carrier/ScanningId"
          options={{ headerShown: false }}
        />
        ;
        <Stack.Screen name="Carrier/Expect" options={{ headerShown: false }} />
        <Stack.Screen
          name="Carrier/EnterBvn"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Carrier/ProfieScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Carrier/FacialSelfie"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Carrier/ScanningScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Carrier/AccountSuccessful"
          options={{ headerShown: false }}
        />
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
