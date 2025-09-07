// app/(delivery)/SelectCarrier.tsx
// -------------------------------------------------------------
// Screen: SelectCarrier
// Purpose: Show a map with route + a bottom sheet-style list of
//          carrier options (walker, bicycle, bike, car).
// Notes:
// - Uses react-native-maps + react-native-maps-directions for the route
// - Requires a Google Maps key with Directions API enabled
// - Icons via MaterialCommunityIcons
// -------------------------------------------------------------

import React, { useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  FlatList,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  LatLng,
  Region,
} from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// ✅ Your API key import (as requested)
import { GOOGLE_MAPS_APIKEY } from "../../constants/Keys";

// ---- Types --------------------------------------------------

type CarrierKind = "walker" | "bicycle" | "bike" | "car";

type CarrierOption = {
  id: string;
  kind: CarrierKind;
  title: string;
  etaMin: number;
  price: number;
  note?: string;
  icon: keyof typeof MCI.glyphMap;
  tint: string;
};

// ---- Constants / Mock Data ---------------------------------

// • Demo Lagos points (feel free to wire these to real locations)
const ORIGIN: LatLng = { latitude: 6.4362, longitude: 3.4346 }; // VI axis
const DEST: LatLng = { latitude: 6.4275, longitude: 3.4331 }; // near Oniru

// • Carrier list rendered in the bottom panel
const CARRIERS: CarrierOption[] = [
  {
    id: "walker",
    kind: "walker",
    title: "Carrier",
    etaMin: 12,
    price: 1500,
    note: "Cheaper but longer delivery time",
    icon: "walk",
    tint: "#22B07D",
  },
  {
    id: "bicycle",
    kind: "bicycle",
    title: "Bicycle Carrier",
    etaMin: 8,
    price: 2500,
    icon: "bicycle",
    tint: "#E84D4D",
  },
  {
    id: "bike",
    kind: "bike",
    title: "Bike Carrier",
    etaMin: 8,
    price: 3000,
    icon: "motorbike",
    tint: "#14A3DB",
  },
  {
    id: "car",
    kind: "car",
    title: "Car Carrier",
    etaMin: 8,
    price: 3800,
    icon: "car",
    tint: "#76A5C7",
  },
];

// • Simple ₦ formatter (Intl sometimes varies across RN envs)
const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

// ---- Component ---------------------------------------------

/**
 * SelectCarrier
 * - Map on top with route, carriers placed along path
 * - Bottom sheet-style panel with selectable carrier cards
 */
export default function SelectCarrier() {
  const router = useRouter();

  // • Track which carrier card is selected
  const [selectedId, setSelectedId] = useState<string>("bike");

  // • Track distance/duration from Directions for UI badge
  const [km, setKm] = useState<number | null>(null);

  // • Map ref for fitting route bounds on load
  const mapRef = useRef<MapView>(null);

  // • Initial region (centered between origin/destination)
  const initialRegion: Region = useMemo(
    () => ({
      latitude: (ORIGIN.latitude + DEST.latitude) / 2,
      longitude: (ORIGIN.longitude + DEST.longitude) / 2,
      latitudeDelta: Math.abs(ORIGIN.latitude - DEST.latitude) * 5 || 0.04,
      longitudeDelta: Math.abs(ORIGIN.longitude - DEST.longitude) * 5 || 0.04,
    }),
    []
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Status bar contrast over map */}
      <StatusBar barStyle="dark-content" />

      {/* ========= Top Map Section ========= */}
      <View style={styles.mapWrap}>
        {/* MapView: Google provider for consistent look */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          initialRegion={initialRegion}
          customMapStyle={MAP_STYLE} // subtle desaturated style
        >
          {/* Origin marker */}
          <Marker coordinate={ORIGIN} title="Pickup">
            <MCI name="map-marker" size={28} color="#0CAF60" />
          </Marker>

          {/* Destination marker */}
          <Marker coordinate={DEST} title="Drop-off">
            <MCI name="map-marker-check" size={28} color="#0077FF" />
          </Marker>

          {/* Direction polyline via Google Directions */}
          <MapViewDirections
            origin={ORIGIN}
            destination={DEST}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={5}
            strokeColor="#00B894"
            lineCap="round"
            lineJoin="round"
            onReady={(res) => {
              // • Save distance for the small badge
              setKm(res.distance); // in km

              // • Fit route nicely within viewport
              mapRef.current?.fitToCoordinates(res.coordinates, {
                edgePadding: { top: 80, right: 60, bottom: 260, left: 60 },
                animated: true,
              });
            }}
          />

          {/* Decorative "carriers along the route" markers */}
          {ROUTE_SPOTS.map((spot, i) => (
            <Marker key={i} coordinate={spot}>
              <MCI name={spot.icon} size={20} color="#10B981" />
            </Marker>
          ))}
        </MapView>

        {/* Floating back button (top-left) */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.fab}
        >
          <MCI name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>

        {/* Distance badge (top-center-ish) */}
        {km !== null && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{km.toFixed(1)} km</Text>
          </View>
        )}
      </View>

      {/* ========= Bottom Sheet-Style Panel ========= */}
      <View style={styles.panel}>
        {/* Heading bar (optional) */}
        <View style={styles.panelHandle} />

        {/* Carrier list (FlatList for performance) */}
        <FlatList
          data={CARRIERS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <CarrierCard
              option={item}
              selected={selectedId === item.id}
              onPress={() => setSelectedId(item.id)}
            />
          )}
        />

        {/* CTA can be added here if you want to continue with selection */}
        {/* <TouchableOpacity style={styles.cta}><Text style={styles.ctaText}>Confirm {selectedId}</Text></TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
}

// ---- Carrier Card ------------------------------------------

/**
 * CarrierCard
 * - Single selectable card with icon, title, ETA, price and optional note
 */
function CarrierCard({
  option,
  selected,
  onPress,
}: {
  option: CarrierOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.card,
        selected && { borderColor: "#10B981", shadowOpacity: 0.18 },
      ]}
    >
      {/* Left: Icon bubble (varies by carrier) */}
      <View
        style={[styles.iconBubble, { backgroundColor: `${option.tint}20` }]}
      >
        <MCI name={option.icon} size={22} color={option.tint} />
      </View>

      {/* Middle: Title + ETA + description */}
      <View style={{ flex: 1 }}>
        {/* Title */}
        <Text style={styles.cardTitle}>{option.title}</Text>

        {/* ETA row */}
        <View style={styles.etaRow}>
          <MCI name="clock-time-four-outline" size={16} color="#6B7280" />
          <Text style={styles.etaText}>
            {" "}
            {option.etaMin} min <Text style={{ color: "#6B7280" }}>away</Text>
          </Text>
        </View>

        {/* Sub description */}
        <Text style={styles.subText}>Package delivery</Text>

        {/* Optional hint/note */}
        {option.note ? (
          <View style={styles.noteWrap}>
            <MCI name="information-outline" size={12} color="#9CA3AF" />
            <Text style={styles.noteText}> {option.note}</Text>
          </View>
        ) : null}
      </View>

      {/* Right: Price */}
      <Text style={styles.price}>{formatNaira(option.price)}</Text>
    </TouchableOpacity>
  );
}

// ---- Styles ------------------------------------------------

const { height, width } = Dimensions.get("window");
const PANEL_BG = "#19C2A3"; // teal-ish to match the mockup tone

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F7F9",
  },
  mapWrap: {
    height: height * 0.46, // Map takes upper section
    backgroundColor: "#E8EEF2",
  },
  fab: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  distanceBadge: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 0.2,
  },
  panel: {
    flex: 1,
    backgroundColor: PANEL_BG,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 8,
    // subtle inner shadow illusion with extra top border
    borderTopWidth: 2,
    borderColor: `${PANEL_BG}90`,
  },
  panelHandle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    opacity: 0.8,
    marginBottom: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 2,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  etaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  etaText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  subText: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
  },
  noteWrap: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  noteText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  price: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  // Optional CTA style if you add a confirm button
  cta: {
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: "#0F9D58",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  ctaText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});

// ---- Subtle custom map style (desaturated) -----------------
const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e5f5ef" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#d6eef9" }],
  },
];

// ---- Little helper spots to drop tiny icons on the route ---
const ROUTE_SPOTS: (LatLng & { icon: keyof typeof MCI.glyphMap })[] = [
  { latitude: 6.4344, longitude: 3.434, icon: "bicycle" },
  { latitude: 6.4322, longitude: 3.4339, icon: "motorbike" },
  { latitude: 6.4304, longitude: 3.4343, icon: "walk" },
  { latitude: 6.4292, longitude: 3.4337, icon: "car" },
];
