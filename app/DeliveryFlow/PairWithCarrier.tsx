import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  StatusBar,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Constants from "expo-constants";

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

const GOOGLE_MAPS_API_KEY =
  Constants?.expoConfig?.extra?.GOOGLE_PLACES_API_KEY ||
  process.env.GOOGLE_PLACES_API_KEY;

/** Try Directions API (v1). If no route, return empty to fall back. */
async function fetchDirectionsPolyline(origin: LatLng, destination: LatLng) {
  if (!GOOGLE_MAPS_API_KEY)
    return { coords: [] as LatLng[], distanceKm: null as number | null };
  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
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

/* ========== Mock carriers (18) with avatars near the midpoint ========== */
type Carrier = {
  id: string;
  name: string;
  type: "Carrier" | "Bicycle" | "Bike" | "Car";
  rating: number;
  photoUrl: string;
  coordinate: LatLng;
};

function jitter(base: LatLng, maxMeters = 800): LatLng {
  // ~ 1e5 lat/lng factor ~ 1m ≈ 1e-5 * cos(lat). Use small deltas.
  const metersToDeg = (m: number) => m / 111320; // approx
  const dx = (Math.random() - 0.5) * 2 * maxMeters;
  const dy = (Math.random() - 0.5) * 2 * maxMeters;
  return {
    latitude: base.latitude + metersToDeg(dy),
    longitude:
      base.longitude +
      metersToDeg(dx) / Math.cos((base.latitude * Math.PI) / 180),
  };
}

const AVATARS = [
  "https://randomuser.me/api/portraits/women/11.jpg",
  "https://randomuser.me/api/portraits/men/12.jpg",
  "https://randomuser.me/api/portraits/women/15.jpg",
  "https://randomuser.me/api/portraits/men/16.jpg",
  "https://randomuser.me/api/portraits/women/22.jpg",
  "https://randomuser.me/api/portraits/men/23.jpg",
  "https://randomuser.me/api/portraits/women/28.jpg",
  "https://randomuser.me/api/portraits/men/29.jpg",
  "https://randomuser.me/api/portraits/women/32.jpg",
  "https://randomuser.me/api/portraits/men/33.jpg",
  "https://randomuser.me/api/portraits/women/36.jpg",
  "https://randomuser.me/api/portraits/men/37.jpg",
  "https://randomuser.me/api/portraits/women/41.jpg",
  "https://randomuser.me/api/portraits/men/42.jpg",
  "https://randomuser.me/api/portraits/women/45.jpg",
  "https://randomuser.me/api/portraits/men/46.jpg",
  "https://randomuser.me/api/portraits/women/49.jpg",
  "https://randomuser.me/api/portraits/men/50.jpg",
];

function buildMockCarriers(center: LatLng, picked: Carrier["type"]): Carrier[] {
  const names = [
    "Joy",
    "Thomas",
    "Sarah",
    "Abel",
    "Kenny",
    "Grace",
    "Lola",
    "Uche",
    "Tolu",
    "Ada",
    "Chidi",
    "Amaka",
    "Ola",
    "Ivy",
    "Dayo",
    "Sade",
    "Ife",
    "Kola",
  ];
  return new Array(18).fill(0).map((_, i) => ({
    id: `c_${i}`,
    name: names[i % names.length],
    type: picked, // all carriers match the selected type
    rating: Math.round((3.8 + Math.random() * 1.2) * 10) / 10,
    photoUrl: AVATARS[i % AVATARS.length],
    coordinate: jitter(center, 1200),
  }));
}

/* ==================== Screen ==================== */
export default function PairWithCarrier() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const parse = (v: unknown): number | null => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

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

  const selectedType = (params.carrier_type as Carrier["type"]) || "Bike";

  const TOTAL = 60;
  const [left, setLeft] = useState(TOTAL);
  const [retryVisible, setRetryVisible] = useState(false);
  const [carriers, setCarriers] = useState<Carrier[]>(() =>
    buildMockCarriers(midpoint, selectedType)
  );
  const carriersFound = carriers.length;

  // When countdown ends, simulate no carrier found
  useEffect(() => {
    if (left === 0) {
      setCarriers([]);
    }
  }, [left]);

  useEffect(() => {
    if (left === 0 && carriersFound === 0) {
      setRetryVisible(true);
    }
  }, [left, carriersFound]);

  // Route polyline (Directions API). If it fails, we fall back to geodesic.
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

  useEffect(() => {
    if (!retryVisible) {
      const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
      return () => clearInterval(id);
    }
  }, [retryVisible]);

  const handleRetry = () => {
    setLeft(TOTAL);
    setRetryVisible(false);
    setCarriers(buildMockCarriers(midpoint, selectedType)); // restore carriers
  };

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const progress = 1 - left / TOTAL;

  const crowKm = kmBetween(origin, destination);
  const distanceText = `${(routeKm ?? crowKm).toFixed(1)} km`;

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {/* Close Icon */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.push("/DeliveryFlow/LocationInput")}
        activeOpacity={0.8}
      >
        <AntDesign name="close" size={22} color="#fff" />
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
          Please wait for a carrier to accept your package
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

        {/* Retry button when countdown is zero and no carrier found */}
        {retryVisible && (
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        )}
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
    width: 28,
    height: 28,
    borderRadius: 14,
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

  /* Retry button */
  retryBtn: {
    marginTop: 18,
    alignSelf: "center",
    backgroundColor: COLOR.brand,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
