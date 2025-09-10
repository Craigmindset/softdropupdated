// app/DeliveryFlow/PairWithCarrier.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Constants from "expo-constants";
import {
  carrierDatabase,
  type Carrier as DBCarrier,
} from "../../constants/carrierdatabase";

/* ==================== Theme ==================== */
const COLOR = {
  bg: "#e8f5e9",
  brand: "#2F7E5D",
  panel: "#ffffff",
  text: "#111",
  sub: "#6b7280",
  pill: "#fff",
  border: "rgba(0,0,0,0.08)",
};

type LatLng = { latitude: number; longitude: number };
type CarrierType = "walk" | "bicycle" | "bike" | "car";

type CarrierNormalized = {
  id: string;
  name: string;
  type: CarrierType;
  phone?: string;
  online: boolean;
  photoUrl: string;
  coordinate: LatLng;
  rating?: number;
};

/* ==================== Helpers ==================== */
const defaultCenter: LatLng = { latitude: 6.5244, longitude: 3.3792 }; // Lagos

const kmBetween = (a: LatLng, b: LatLng) => {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

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

/** Directions API (v1). If it fails, we fall back to a simple geodesic line. */
async function fetchDirectionsPolyline(origin: LatLng, destination: LatLng) {
  if (!GOOGLE_MAPS_APIKEY)
    return { coords: [] as LatLng[], distanceKm: null as number | null };
  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${GOOGLE_MAPS_APIKEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const route = data?.routes?.[0];
    const leg = route?.legs?.[0];
    if (route?.overview_polyline?.points) {
      return {
        coords: decodePolyline(route.overview_polyline.points),
        distanceKm: leg ? leg.distance.value / 1000 : null,
      };
    }
  } catch {}
  return { coords: [] as LatLng[], distanceKm: null as number | null };
}

/** Normalize a row from your carrierdatabase into the shape we render. */
function normalize(row: DBCarrier): CarrierNormalized | null {
  const hasCoords =
    typeof row.latitude === "number" && typeof row.longitude === "number";
  if (!hasCoords) return null; // skip items without coordinates
  const type = (row.carrier_type?.toLowerCase() as CarrierType) || "walk";
  return {
    id: row.carrier_id,
    name: row.carrier_name,
    type,
    phone: row.carrier_phone,
    online: !!row.carrier_online,
    photoUrl:
      row.carrier_photo_url ||
      `https://ui-avatars.com/api/?background=2F7E5D&color=fff&name=${encodeURIComponent(
        row.carrier_name || "Carrier"
      )}`,
    coordinate: { latitude: row.latitude!, longitude: row.longitude! },
  };
}

/** Accept multiple param spellings and map to DB type values. */
function normalizeTypeParam(v: unknown): CarrierType | undefined {
  const s = String(v ?? "")
    .toLowerCase()
    .trim();
  if (!s) return undefined;
  if (["walk", "walking", "carrier"].includes(s)) return "walk";
  if (["bicycle", "cycle", "cycling"].includes(s)) return "bicycle";
  if (["bike", "motorbike", "motorcycle", "driving"].includes(s)) return "bike";
  if (["car", "vehicle"].includes(s)) return "car";
  return undefined;
}

/* ==================== Screen ==================== */
export default function PairWithCarrier() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const parse = (v: unknown): number | null => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
    // keep NaN/undefined from breaking MapView
  };

  // Sender/Receiver from params with safe fallbacks
  const origin: LatLng = useMemo(() => {
    const lat = parse(params.sender_latitude);
    const lng = parse(params.sender_longitude);
    return lat !== null && lng !== null
      ? { latitude: lat, longitude: lng }
      : defaultCenter;
  }, [params]);

  const destination: LatLng = useMemo(() => {
    const lat = parse(params.receiver_latitude);
    const lng = parse(params.receiver_longitude);
    return lat !== null && lng !== null
      ? { latitude: lat, longitude: lng }
      : defaultCenter;
  }, [params]);

  const midpoint: LatLng = useMemo(
    () => ({
      latitude: (origin.latitude + destination.latitude) / 2,
      longitude: (origin.longitude + destination.longitude) / 2,
    }),
    [origin, destination]
  );

  // Optional filter by selected type coming from previous screen
  const selectedType = normalizeTypeParam(params.carrier_type);

  // Normalize + filter: only online carriers (and by selectedType if provided)
  const carriers: CarrierNormalized[] = useMemo(() => {
    const list = carrierDatabase
      .map(normalize)
      .filter(Boolean) as CarrierNormalized[];
    return list.filter(
      (c) => c.online && (!selectedType || c.type === selectedType)
    );
  }, [selectedType]);

  const carriersFound = carriers.length;

  // Route polyline (Directions API). If it fails, fall back to geodesic.
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [routeKm, setRouteKm] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { coords, distanceKm } = await fetchDirectionsPolyline(
        origin,
        destination
      );
      if (!cancelled) {
        setRouteCoords(coords);
        setRouteKm(distanceKm);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [origin, destination]);

  // Fit map to all markers & route
  const mapRef = useRef<MapView | null>(null);
  useEffect(() => {
    const coords = [
      origin,
      destination,
      ...carriers.map((c) => c.coordinate),
      ...(routeCoords.length ? routeCoords : []),
    ];
    setTimeout(() => {
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 40, bottom: 220, left: 40 },
        animated: true,
      });
    }, 80);
  }, [origin, destination, carriers, routeCoords]);

  // Countdown (60 seconds)
  const TOTAL = 60;
  const [left, setLeft] = useState(TOTAL);
  useEffect(() => {
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const progress = 1 - left / TOTAL;

  const crowKm = kmBetween(origin, destination);
  const distanceText = `${(routeKm ?? crowKm).toFixed(1)} km`;

  return (
    <View style={styles.container}>
      {/* Back */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <AntDesign name="arrowleft" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Map */}
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: midpoint.latitude,
            longitude: midpoint.longitude,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          }}
          userInterfaceStyle="light"
          showsUserLocation
          showsMyLocationButton
        >
          {/* Origin / Destination */}
          <Marker coordinate={origin} title="Sender" />
          <Marker coordinate={destination} title="Receiver" />

          {/* Route line (turn-by-turn if available) */}
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

          {/* Carrier avatars as map pins */}
          {carriers.map((c) => (
            <Marker
              key={c.id}
              coordinate={c.coordinate}
              anchor={{ x: 0.5, y: 1 }}
              title={c.name}
              description={c.type}
            >
              <View style={styles.avatarPin}>
                <Image source={{ uri: c.photoUrl }} style={styles.avatarImg} />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Distance pill */}
        <View style={styles.pill}>
          <Text style={styles.pillText}>{distanceText}</Text>
        </View>
      </View>

      {/* Bottom sheet-style card */}
      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>
          {carriersFound} courier{carriersFound === 1 ? "" : "s"} found
        </Text>
        <Text style={styles.sheetSub}>
          Please wait for a courier to accept your package
        </Text>

        {/* Countdown boxes */}
        <View style={styles.timerRow}>
          <View style={styles.timeBox}>
            <Text style={styles.timeTxt}>{mm[0]}</Text>
          </View>
          <View style={styles.timeBox}>
            <Text style={styles.timeTxt}>{mm[1]}</Text>
          </View>
          <Text style={styles.colon}>:</Text>
          <View style={styles.timeBox}>
            <Text style={styles.timeTxt}>{ss[0]}</Text>
          </View>
          <View style={styles.timeBox}>
            <Text style={styles.timeTxt}>{ss[1]}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(100, Math.max(0, progress * 100))}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

/* ==================== Styles ==================== */
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
    backgroundColor: "#dfe6e9",
  },
  map: { width: "100%", height: "100%" },

  pill: {
    position: "absolute",
    right: 16,
    top: 16,
    backgroundColor: COLOR.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    elevation: 4,
  },
  pillText: { fontWeight: "700", color: "#222" },

  /* Avatar pin */
  avatarPin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
    elevation: 3,
  },
  avatarImg: { width: "100%", height: "100%" },

  /* Bottom card */
  sheet: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    backgroundColor: COLOR.panel,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLOR.text,
    textAlign: "center",
  },
  sheetSub: { textAlign: "center", color: COLOR.sub, marginTop: 6 },

  timerRow: {
    marginTop: 18,
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    gap: 6,
  },
  timeBox: {
    width: 36,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#f5f6f7",
    borderWidth: 1,
    borderColor: COLOR.border,
    justifyContent: "center",
    alignItems: "center",
  },
  timeTxt: { fontSize: 18, fontWeight: "700", color: "#111" },
  colon: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    marginHorizontal: 2,
  },

  progressTrack: {
    height: 6,
    backgroundColor: "#d9d9d9",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 16,
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLOR.brand,
  },
});
