import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  PanResponder,
  Animated,
  Dimensions,
} from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Circle,
} from "react-native-maps";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Constants from "expo-constants";

/* ============================================================================
  THEME
============================================================================ */
const COLOR = {
  brand: "#2F7E5D",
  bg: "#e8f5e9",
  sheet: "#ffffff",
  text: "#0B0F0E",
  sub: "#6B7280",
  border: "rgba(0,0,0,0.08)",
  pill: "#ffffff",
  danger: "#EF4444",
  success: "#10B981",
};

type LatLng = { latitude: number; longitude: number };

/* ============================================================================
  HELPERS
============================================================================ */

/** Safer number parser for query params (returns null on NaN). */
const parseNum = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Haversine (fallback distance in km if Directions isn’t available). */
const crowKm = (a: LatLng, b: LatLng) => {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
};

/** Google encoded polyline decoder → array of LatLng points. */
const decodePolyline = (encoded: string): LatLng[] => {
  let points: LatLng[] = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let b = 0,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
};

import { GOOGLE_MAPS_APIKEY } from "../../constants/Keys";
  Constants?.expoConfig?.extra?.GOOGLE_PLACES_API_KEY ||
  process.env.GOOGLE_PLACES_API_KEY;

/**
 * Try to fetch a turn-by-turn route polyline from Directions API.
 * If it fails, the caller should fall back to a simple geodesic line.
 */
async function fetchDirectionsPolyline(origin: LatLng, destination: LatLng) {
  if (!GOOGLE_MAPS_APIKEY)
    return { coords: [] as LatLng[], km: null as number | null };
  try {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${GOOGLE_MAPS_APIKEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const route = data?.routes?.[0];
    const leg = route?.legs?.[0];

    if (route?.overview_polyline?.points) {
      return {
        coords: decodePolyline(route.overview_polyline.points),
        km: leg ? leg.distance.value / 1000 : null,
      };
    }
  } catch {
    // swallow and return empty to fall back
  }
  return { coords: [] as LatLng[], km: null as number | null };
}

/* ============================================================================
  SCREEN
============================================================================ */

export default function Accept() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // ---- Input params (from previous screen) with safe fallbacks
  const origin: LatLng = useMemo(() => {
    const lat = parseNum(params.sender_latitude) ?? 6.5244; // Lagos
    const lng = parseNum(params.sender_longitude) ?? 3.3792;
    return { latitude: lat, longitude: lng };
  }, [params]);

  const destination: LatLng = useMemo(() => {
    const lat = parseNum(params.receiver_latitude) ?? 6.465422;
    const lng = parseNum(params.receiver_longitude) ?? 3.406448;
    return { latitude: lat, longitude: lng };
  }, [params]);

  const senderAddress = (params.sender_location as string) || "Sender address";
  const receiverAddress =
    (params.receiver_location as string) || "Receiver address";

  const carrierName = (params.carrier_name as string) || "Joy Hector";
  const carrierPhone = (params.carrier_phone as string) || "+234 801 234 5678";
  const carrierType = (params.carrier_type as string) || "Car"; // Carrier | Bike | Bicycle | Car
  const itemType = (params.item_type as string) || "Gadget"; // Fragile | Document | Gadget | Clothes ...
  const amount =
    typeof params.amount === "string" && params.amount.trim() !== ""
      ? params.amount
      : "₦8,200";

  const avatarUrl =
    (params.carrier_photo_url as string) ||
    "https://randomuser.me/api/portraits/women/44.jpg";

  // ---- Route polyline (try Directions; fall back to straight geodesic)
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const d = await fetchDirectionsPolyline(origin, destination);
      if (!mounted) return;
      setRouteCoords(d.coords);
      setDistanceKm(d.km ?? crowKm(origin, destination));
    })();
    return () => {
      mounted = false;
    };
  }, [origin, destination]);

  // ---- Fit the map to markers / route nicely
  const mapRef = useRef<MapView | null>(null);
  useEffect(() => {
    const all = [
      origin,
      destination,
      ...(routeCoords.length ? routeCoords : []),
    ];
    setTimeout(() => {
      mapRef.current?.fitToCoordinates(all, {
        edgePadding: { top: 80, right: 40, bottom: 260, left: 40 },
        animated: true,
      });
    }, 80);
  }, [origin, destination, routeCoords]);

  const distanceText = distanceKm ? `${distanceKm.toFixed(1)} km` : "";

  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const drawerMaxHeight = SCREEN_HEIGHT * 0.8;
  const drawerMinHeight = SCREEN_HEIGHT * 0.4;
  const [drawerHeight] = useState(new Animated.Value(drawerMaxHeight));
  const [drawerOpen, setDrawerOpen] = useState(true);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 10,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 40) {
            Animated.timing(drawerHeight, {
              toValue: drawerMinHeight,
              duration: 250,
              useNativeDriver: false,
            }).start(() => setDrawerOpen(false));
          } else if (gestureState.dy < -40) {
            Animated.timing(drawerHeight, {
              toValue: drawerMaxHeight,
              duration: 250,
              useNativeDriver: false,
            }).start(() => setDrawerOpen(true));
          }
        },
      }),
    [drawerHeight, drawerMaxHeight, drawerMinHeight]
  );

  useEffect(() => {
    Animated.timing(drawerHeight, {
      toValue: drawerOpen ? drawerMaxHeight : drawerMinHeight,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [drawerOpen, drawerHeight, drawerMaxHeight, drawerMinHeight]);

  const distancePill = {
    position: "absolute" as const,
    top: 16,
    right: 16,
    backgroundColor: COLOR.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 4,
  };
  const distanceTextStyle = { fontWeight: "700", color: "#222" };

  const avatarPin = {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
    elevation: 3,
  };
  const avatarImg = { width: "100%", height: "100%" };

  return (
    <View style={styles.container}>
      {/* Back button over the map */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <AntDesign name="arrowleft" size={20} color="#fff" />
      </TouchableOpacity>

      {/* ================== MAP ================== */}
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: (origin.latitude + destination.latitude) / 2,
            longitude: (origin.longitude + destination.longitude) / 2,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          }}
          showsUserLocation
          showsMyLocationButton
          userInterfaceStyle="light"
        >
          {/* Nice soft focus ring around destination (design hint) */}
          <Circle
            center={destination}
            radius={700}
            strokeColor="transparent"
            fillColor="rgba(47,126,93,0.10)"
          />
          <Circle
            center={destination}
            radius={350}
            strokeColor="transparent"
            fillColor="rgba(47,126,93,0.18)"
          />

          {/* Sender & Receiver markers */}
          <Marker coordinate={origin} title="Pickup" />
          <Marker coordinate={destination} title="Drop-off" />

          {/* Route line: turn-by-turn if available, else straight geodesic */}
          {routeCoords.length > 1 ? (
            <Polyline
              coordinates={routeCoords}
              strokeColor={COLOR.brand}
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
              geodesic
            />
          ) : (
            <Polyline
              coordinates={[origin, destination]}
              strokeColor={COLOR.brand}
              strokeWidth={4}
              geodesic
            />
          )}

          {/* Accepted carrier pin (avatar) near pickup for emphasis */}
          <Marker coordinate={origin} anchor={{ x: 0.5, y: 1 }}>
            <View style={styles.avatarPin}>
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
            </View>
          </Marker>
        </MapView>

        {/* Distance pill like the mock (“331 miles”) */}
        {!!distanceText && (
          <View style={distancePill}>
            <Text style={distanceTextStyle}>{distanceText}</Text>
          </View>
        )}
      </View>

      {/* ================== BOTTOM SHEET / DRAWER ================== */}
      <Animated.View
        style={[styles.drawer, { height: drawerHeight }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.drawerHandle}>
          <View style={styles.drawerBar} />
        </View>
        {drawerOpen ? (
          <>
            <Text style={styles.acceptedTitle}>
              {carrierName} accepted your order
            </Text>
            <View style={styles.headerRow}>
              <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.nameText}>{carrierName}</Text>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={18}
                    color={COLOR.brand}
                    style={{ marginLeft: 6 }}
                  />
                </View>
                <Text style={styles.subText}>{carrierPhone}</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Vertical milestones (simple timeline feel like the mock) */}
            <View style={styles.timelineRow}>
              <View style={styles.timelineDots}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={[styles.dotLine]} />
                <View style={[styles.dot, styles.dotActive]} />
                <View style={[styles.dotLine]} />
                <View style={[styles.dot]} />
              </View>
              <View style={{ flex: 1 }}>
                <DetailRow label="Carrier Type" value={carrierType} />
                <DetailRow label="Item Type" value={itemType} />
                <DetailRow
                  label="Destination"
                  value={`${senderAddress} → ${receiverAddress}`}
                  multiline
                />
                <DetailRow label="Amount" value={amount} />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <Action
                icon="message-text"
                label="Message"
                onPress={() => {
                  /* open chat */
                }}
              />
              <Action
                icon="phone-in-talk"
                label="Internet call"
                onPress={() => Linking.openURL(`tel:${carrierPhone}`)}
              />
              <Action
                icon="wallet"
                label="Wallet Account"
                onPress={() => {
                  /* open wallet */
                }}
              />
            </View>

            {/* Primary CTA */}
            <TouchableOpacity
              style={styles.payBtn}
              activeOpacity={0.9}
              onPress={() => {
                /* go to payment */
              }}
            >
              <Text style={styles.payBtnText}>Make Payment</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={{ alignItems: "center", width: "100%" }}>
            <View style={styles.headerRow}>
              <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.nameText}>{carrierName}</Text>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={18}
                    color={COLOR.brand}
                    style={{ marginLeft: 6 }}
                  />
                </View>
                <Text style={styles.subText}>{carrierPhone}</Text>
              </View>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

/* ============================================================================
  SMALL UI SUB-COMPONENTS
============================================================================ */

/** One line of label → value in the details list. */
function DetailRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[styles.detailValue, multiline && { lineHeight: 20 }]}
        numberOfLines={multiline ? 3 : 1}
      >
        {value}
      </Text>
    </View>
  );
}

/** Action button icon + label (Message / Call / Wallet). */
function Action({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.action}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons name={icon} size={22} color={COLOR.text} />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ============================================================================
  STYLES
============================================================================ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.bg },

  backBtn: {
    position: "absolute",
    top: 48,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },

  mapWrap: {
    height: "58%",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  map: { width: "100%", height: "100%" },

  drawer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLOR.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 20,
    overflow: "hidden",
    alignItems: "center",
  },
  drawerHandle: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
  },
  drawerBar: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d1d5db",
    marginBottom: 4,
  },

  sheet: {
    flex: 1,
    backgroundColor: COLOR.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
    elevation: 6,
  },

  acceptedTitle: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerAvatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  nameText: { fontSize: 16, fontWeight: "700", color: COLOR.text },
  subText: { color: COLOR.sub, marginTop: 2 },

  divider: {
    height: 1,
    backgroundColor: COLOR.border,
    marginVertical: 10,
  },

  timelineRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  timelineDots: { alignItems: "center" },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D1D5DB",
  },
  dotActive: { backgroundColor: COLOR.brand },
  dotLine: {
    width: 2,
    height: 18,
    backgroundColor: "#D1D5DB",
    marginVertical: 2,
  },

  detailLabel: { color: COLOR.sub, fontSize: 12 },
  detailValue: { color: COLOR.text, fontSize: 14, fontWeight: "600" },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 16,
  },
  action: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLOR.border,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: "#F9FAFB",
  },
  actionText: {
    marginTop: 6,
    fontWeight: "600",
    color: COLOR.text,
    fontSize: 12,
  },

  payBtn: {
    backgroundColor: "#0B0F0E",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 14,
  },
  payBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  avatarPin: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    zIndex: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  distancePill: {
    position: "absolute",
    top: 24,
    right: 24,
    backgroundColor: "#222",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 2,
  },
  distanceTextStyle: {
    fontWeight: "700",
    color: "#fff",
  },
});
