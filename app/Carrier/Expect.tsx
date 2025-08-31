// Carrier/Expect.tsx
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

type Props = {
  onBack?: () => void;
  onBVN?: () => void;
  onID?: () => void;
  onFace?: () => void;
  onReady?: () => void;
};

const GREEN = "#21C15A";
const TEXT_DARK = "#231815";
const CARD_BG = "#F6F7F8";
const MUTED = "#6F6B6A";
const SHADOW = "#000000";

const Expect = ({ onBack, onBVN, onID, onFace, onReady }: Props) => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Back button */}
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
        <Text style={styles.title}>Verify your Identity</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Follow these steps to verify your{"\n"}identity to begin the use
          SoftDrop as a Carrier
        </Text>

        {/* Cards */}
        <TouchableOpacity
          onPress={() => router.push("/Carrier/EnterBvn")}
          style={styles.card}
          activeOpacity={0.8}
        >
          <View style={styles.cardLeft}>
            <Text style={styles.cardIcon}>🪪</Text>
            <View>
              <Text style={styles.cardText}>NIN Verification</Text>
              <Text style={styles.cardDesc}>
                Your 11 digit NIN will be required here for validation
              </Text>
            </View>
          </View>
          <Text style={styles.chev}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onID}
          style={styles.card}
          activeOpacity={0.8}
        >
          <View style={styles.cardLeft}>
            <Text style={styles.cardIcon}>📖</Text>
            <View>
              <Text style={styles.cardText}>ID Documentation</Text>
              <Text style={styles.cardDesc}>
                Required Valid ID | Int.Passport, Driver License, NIN card
              </Text>
            </View>
          </View>
          <Text style={styles.chev}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onFace}
          style={styles.card}
          activeOpacity={0.8}
        >
          <View style={styles.cardLeft}>
            <Text style={styles.cardIcon}>🙂</Text>
            <View>
              <Text style={styles.cardText}>Face Capture</Text>
              <Text style={styles.cardDesc}>
                Facial authentication will be required.
              </Text>
            </View>
          </View>
          <Text style={styles.chev}>›</Text>
        </TouchableOpacity>

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onReady}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>I’m ready</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Expect;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // top
  topBar: { height: 44, justifyContent: "center" },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { fontSize: 20, color: TEXT_DARK },

  // header
  title: {
    marginTop: 26,
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 14,
    fontSize: 13,
    color: MUTED,
    textAlign: "center",
    lineHeight: 20,
  },

  // cards
  card: {
    marginTop: 10,
    backgroundColor: CARD_BG,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardIcon: { fontSize: 18 },
  cardText: { fontSize: 15, color: TEXT_DARK },
  cardDesc: {
    fontSize: 10,
    color: "#001F54", // navy blue
    marginTop: 2,
    maxWidth: 210,
  },

  chev: { fontSize: 24, color: "#8E8E93" },

  // cta
  cta: {
    marginTop: 36,
    backgroundColor: GREEN,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
