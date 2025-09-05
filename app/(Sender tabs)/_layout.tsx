import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: Colors[colorScheme ?? "light"].background, // use app bg color
            paddingBottom: 18,
          },
          default: {
            backgroundColor: Colors[colorScheme ?? "light"].background, // use app bg color
            paddingBottom: 16,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="Wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => (
            <MaterialIcons
              name="person"
              size={20}
              color={focused ? "#0077B6" : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => (
            <MaterialIcons
              name="receipt-long"
              size={20}
              color={focused ? "#0077B6" : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Home"
        options={{
          title: "",
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => (
            <View
              style={{
                backgroundColor: "#006400", // dark green always
                borderRadius: 32,
                width: 56,
                height: 56,
                justifyContent: "center",
                alignItems: "center",
                elevation: 6,
                shadowColor: "#000000ff",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                marginBottom: focused ? 16 : 0,
              }}
            >
              <MaterialIcons
                name="home"
                size={25}
                color="#fff" // always white
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="Rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => (
            <MaterialIcons
              name="card-giftcard"
              size={20}
              color={focused ? "#0077B6" : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="More"
        options={{
          title: "More",
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => (
            <MaterialIcons
              name="more-horiz"
              size={20}
              color={focused ? "#0077B6" : color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
