// Carrier/ProfileScreen.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileScreen = () => {
  const router = useRouter();
  // Static data for now; can be replaced with props or API state
  const profile = {
    first_name: "Craig",
    last_name: "Wealth",
    middle_name: "Chinedu",
    date_of_birth: "1990-07-15",
    gender: "Male",
    phone_number: "08012345678",
    email: "example@email.com",
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backBtn}
          >
            <MaterialIcons
              name="arrow-back-ios-new"
              size={22}
              color="#222"
              style={{
                backgroundColor: "#F3F4F6",
                borderRadius: 18,
                padding: 7,
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Your verified identity details</Text>

        {/* Info Cards */}
        <View style={styles.card}>
          <Text style={styles.label}>First Name</Text>
          <Text style={styles.value}>{profile.first_name}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Last Name</Text>
          <Text style={styles.value}>{profile.last_name}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Middle Name</Text>
          <Text style={styles.value}>{profile.middle_name}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Date of Birth</Text>
          <Text style={styles.value}>{profile.date_of_birth}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>{profile.gender}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.value}>{profile.phone_number}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile.email}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const GREEN = "#21C15A";
const TEXT_DARK = "#231815";
const MUTED = "#6F6B6A";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
  },
  topBar: { height: 44, justifyContent: "center" },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { fontSize: 20, color: TEXT_DARK },
  title: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: MUTED,
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    marginTop: 8,
    backgroundColor: "#F6F7F8",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  label: { fontSize: 13, color: MUTED, marginBottom: 4 },
  value: { fontSize: 15, fontWeight: "600", color: TEXT_DARK },
});
