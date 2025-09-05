import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LottieView from "lottie-react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

const steps = [
  "Enter your phone number to continue",
  "Enter the 4 Digits pin shared from the sender",
  "Track Carrier and Items",
  "Receive Item",
  "Rate Carriers",
];

export default function Expect() {
  const router = useRouter();
  return (
    <View
      style={[
        styles.container,
        { marginTop: 0, backgroundColor: "#fff", flex: 1 },
      ]}
    >
      <StatusBar style="dark" backgroundColor="#fff" />
      <LottieView
        source={require("../../assets/images/Box - 1748984413113.json")}
        autoPlay
        loop
        style={styles.lottie}
      />
      <Text style={styles.title}>What's Required</Text>
      <View style={styles.list}>
        {steps.map((step, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>{step}</Text>
            {idx === 4 && (
              <View style={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <MaterialIcons
                    key={i}
                    name="star"
                    size={20}
                    color="#FFD700"
                    style={{ marginLeft: 2 }}
                  />
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/Receiver/Registration")}
      >
        <Text style={styles.buttonText}>Begin</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  lottie: {
    width: 180,
    height: 180,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 18,
    textAlign: "center",
  },
  list: {
    width: "100%",
    marginBottom: 32,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#21C15A",
    marginRight: 12,
  },
  bulletText: {
    fontSize: 16,
    color: "#222",
    flex: 1,
  },
  stars: {
    flexDirection: "row",
    marginLeft: 8,
  },
  button: {
    backgroundColor: "#21C15A",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
