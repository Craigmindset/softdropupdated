// app/DeliveryFlow/Accept.tsx
import React, { useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar as RNStatusBar,
  Dimensions,
  Animated,
  PanResponder,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";

const COLOR = {
  brand: "#2F7E5D",
  brandDark: "#0E5A40",
  bg: "#E9F3EC", // page background
  card: "#E3F0E7", // drawer background (soft green)
  text: "#0B0F0E",
  sub: "#6B7280",
  divider: "rgba(16, 24, 40, 0.12)",
  border: "rgba(16, 24, 40, 0.10)",
  success: "#21C15A",
};

const { height: SCREEN_H } = Dimensions.get("window");
// Snap points (tweak freely):
const MAX_H = SCREEN_H * 0.78; // expanded height (~78%)
const MIN_H = SCREEN_H * 0.35; // collapsed height (~35%) -> "below 40%"

export default function Accept() {
  const p = useLocalSearchParams();

  // ------- Data (same as your version)
  const carrierName = String(p.carrier_name || "Lisa Biker");
  const carrierPhone = String(p.carrier_phone || "+2348010000006");
  const carrierType = String(p.carrier_type || "bike");
  const carrierRank = String(p.carrier_rank || "Yellow Belt");
  const avatarUrl = String(
    p.carrier_photo_url || "https://randomuser.me/api/portraits/women/44.jpg"
  );

  const itemType = String(p.itemType || p.item_type || "Gadget");
  const quantity = Number(p.quality || p.qty || 1);
  const senderAddress = String(
    p.sender_location || "Iceland Civic Centre, Lagos, Nigeria"
  );
  const receiverAddress = String(
    p.receiver_location || "Lekki Phase 1, Lagos, Nigeria"
  );
  const receiverName = String(
    p.receiverName || p.receiver_name || "Michael Smith"
  );
  const receiverContact = String(
    p.receiverContact || p.receiver_contact || "08375454649"
  );
  const estimatedPrice = String(p.estimated_price || p.amount || "₦8,200");

  // ------- Drawer animation + gestures
  const drawerH = useRef(new Animated.Value(MAX_H)).current;
  const isExpanded = useRef(true);

  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max);

  const snapTo = (target: number) => {
    Animated.spring(drawerH, {
      toValue: target,
      useNativeDriver: false,
      friction: 9,
      tension: 90,
    }).start(() => {
      isExpanded.current = target === MAX_H;
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 8,
        onPanResponderMove: (_, g) => {
          // drag down increases dy → reduce height; drag up decreases dy → increase height
          const next = clamp(MAX_H - g.dy, MIN_H, MAX_H);
          drawerH.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          const current = (drawerH as any)._value as number;
          const halfway = (MIN_H + MAX_H) / 2;
          // Use velocity and position to decide
          if (g.vy > 0.6) snapTo(MIN_H);
          else if (g.vy < -0.6) snapTo(MAX_H);
          else snapTo(current >= halfway ? MAX_H : MIN_H);
        },
      }),
    [drawerH]
  );

  const toggleHandle = () => snapTo(isExpanded.current ? MIN_H : MAX_H);

  return (
    <SafeAreaView style={styles.safe}>
      <RNStatusBar barStyle="dark-content" />

      {/* Top Illustration stays behind the drawer */}
      <View style={{ alignItems: "center", marginTop: 32 }}>
        <Image
          source={require("../../assets/images/accept.jpg")}
          style={styles.hero}
          resizeMode="cover"
        />
        <Text style={styles.heroTitle}>Delivery Accepted</Text>
      </View>

      {/* Drawer */}
      <Animated.View style={[styles.drawer, { height: drawerH }]}>
        {/* Drag handle */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleHandle}
          {...panResponder.panHandlers}
          style={styles.handleHitbox}
        >
          <View style={styles.handleBar} />
        </TouchableOpacity>

        {/* Drawer content is scrollable, but the handle area grabs drag first */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Accepted line */}
          <Text style={styles.acceptedLine}>
            <Text style={styles.acceptedBold}>{carrierName}</Text> has accepted
            your request
          </Text>

          {/* Profile row */}
          <View style={styles.profileRow}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              <View style={styles.verifiedDot}>
                <MCI name="check-decagram" size={14} color={COLOR.success} />
              </View>
            </View>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.iconRow}>
                <MCI name="account" size={16} color={COLOR.brand} />
                <Text style={styles.nameText}>{carrierName}</Text>
              </View>
              <View style={styles.iconRow}>
                <MCI name="phone" size={16} color={COLOR.brand} />
                <Text style={styles.subText}>{carrierPhone}</Text>
              </View>

              <View style={styles.badgeRow}>
                <Badge icon="truck-delivery-outline" text={carrierType} />
                <Badge icon="star-circle-outline" text={carrierRank} />
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Details (Item Type | Quantity) */}
          <View style={styles.pairRow}>
            <Row
              icon="cube-outline"
              label="Item Type"
              value={itemType}
              style={{ flex: 1 }}
            />
            <Row
              icon="checkbox-marked-outline"
              label="Quantity"
              value={String(quantity)}
              style={{ flex: 1 }}
            />
          </View>

          {/* Full width rows */}
          <Row
            icon="account-outline"
            label="Receiver Name"
            value={receiverName}
          />
          <Row
            icon="phone-outline"
            label="Receiver contact"
            value={receiverContact}
          />
          <Row
            icon="map-marker-outline"
            label="Pick-up"
            value={senderAddress}
          />
          <Row
            icon="map-marker-check-outline"
            label="Drop-Off"
            value={receiverAddress}
          />
          <Row
            icon="cash-multiple"
            label="Estimated Price"
            value={estimatedPrice}
          />

          <View style={styles.divider} />

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Action
              icon="message-text-outline"
              text="Send Message"
              onPress={() => {}}
            />
            <Action icon="wallet-outline" text="Wallet" onPress={() => {}} />
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.cta}
            activeOpacity={0.9}
            onPress={() => {}}
          >
            <Text style={styles.ctaText}>Make Payment</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ---- Small components ---- */
function Badge({
  icon,
  text,
}: {
  icon: keyof typeof MCI.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.badge}>
      <MCI name={icon} size={14} color={COLOR.brand} />
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  style,
}: {
  icon: keyof typeof MCI.glyphMap;
  label: string;
  value: string;
  style?: any;
}) {
  return (
    <View style={[rowStyles.row, style]}>
      <View style={rowStyles.iconWrap}>
        <MCI name={icon} size={18} color={COLOR.brand} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={rowStyles.label}>{label}</Text>
        <Text style={rowStyles.value} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function Action({
  icon,
  text,
  onPress,
}: {
  icon: keyof typeof MCI.glyphMap;
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={actionStyles.wrap}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <MCI name={icon} size={20} color={COLOR.brand} />
      <Text style={actionStyles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

/* ---- Styles ---- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },

  hero: {
    width: "90%",
    height: 210,
    borderRadius: 24,
    marginBottom: 8,
    marginTop: 16,
    backgroundColor: COLOR.card,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLOR.brand,
    marginTop: 10,
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: "center",
  },

  drawer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLOR.card,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 8,
    // shadow/elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },

  handleHitbox: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handleBar: {
    width: 80,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLOR.brand,
  },

  acceptedLine: {
    fontSize: 16,
    color: COLOR.text,
    marginTop: 8,
    marginBottom: 10,
  },
  acceptedBold: { fontWeight: "800", color: COLOR.text },

  profileRow: { flexDirection: "row", alignItems: "center" },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: COLOR.brand,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  avatar: { width: "100%", height: "100%" },
  verifiedDot: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.border,
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  nameText: { fontSize: 14, fontWeight: "800", color: COLOR.text },
  subText: { fontSize: 12, fontWeight: "700", color: COLOR.sub },

  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#fff",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.border,
  },
  badgeText: { fontSize: 12, color: COLOR.brand, fontWeight: "800" },

  divider: { height: 1, backgroundColor: COLOR.divider, marginVertical: 12 },

  pairRow: { flexDirection: "row", gap: 12, marginBottom: 4 },

  actionsRow: { flexDirection: "row", gap: 10, marginTop: 6 },

  cta: {
    marginTop: 18,
    backgroundColor: COLOR.brandDark,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    columnGap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECF6F0",
  },
  label: {
    fontSize: 12,
    color: COLOR.sub,
    fontWeight: "800",
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: COLOR.text,
    fontWeight: "700",
  },
});

const actionStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLOR.border,
    flexDirection: "row",
    gap: 8,
  },
  text: { fontSize: 13, color: COLOR.brand, fontWeight: "800" },
});
