import {
  AntDesign,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { carrierDatabase } from "../../constants/carrierdatabase";

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */
const COLOR = {
  bg: "#e8f5e9",
  mapTop: "#ccc",
  panel: "#00c2a8",
  cardBg: "#fff",
  text: "#000",
  sub: "#555",
  brand: "#2F7E5D",
};

type LatLng = { latitude: number; longitude: number };

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
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

const minutesFromKm = (km: number, kmh: number) =>
  Math.max(1, Math.round((km / kmh) * 60)); // at least 1 min

/* Offline speeds for local ETA fallback */
const SPEEDS = { WALK: 4.5, BICYCLE: 15, TWO_WHEELER: 28, CAR: 35 };

const priceFromKmMin = (km: number, min: number, base: number) =>
  `₦${Math.round(base + km * 100 + min * 50).toLocaleString()}`;

/* Decode Google encoded polyline */
function decodePolyline(encoded: string): LatLng[] {
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
}

/* Key (uses the same extra/env pattern you had) */
import { GOOGLE_MAPS_APIKEY } from "../../constants/Keys";

/* Fetch route polyline:
   1) Directions API v1
   2) Fallback to Routes API v2
*/
async function fetchRoutePolyline(
  origin: LatLng,
  destination: LatLng
): Promise<{ coords: LatLng[]; distanceKm?: number; etaMin?: number }> {
  // -- Try classic Directions API (easier to enable)
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${GOOGLE_MAPS_APIKEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const route = data?.routes?.[0];
    const leg = route?.legs?.[0];
    if (route?.overview_polyline?.points) {
      return {
        coords: decodePolyline(route.overview_polyline.points),
        distanceKm: leg ? leg.distance.value / 1000 : undefined,
        etaMin: leg ? Math.round(leg.duration.value / 60) : undefined,
      };
    }
  } catch {}

  // -- Fallback: Routes API v2
  try {
    const res = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": String(GOOGLE_MAPS_APIKEY),
          "X-Goog-FieldMask":
            "routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration",
        },
        body: JSON.stringify({
          origin: { location: { latLng: origin } },
          destination: { location: { latLng: destination } },
          travelMode: "DRIVE",
        }),
      }
    );
    const data = await res.json();
    const r = data?.routes?.[0];
    const encoded = r?.polyline?.encodedPolyline;
    if (encoded) {
      return {
        coords: decodePolyline(encoded),
        distanceKm: r?.distanceMeters ? r.distanceMeters / 1000 : undefined,
        etaMin: r?.duration
          ? Math.round(Number(String(r.duration).replace("s", "")) / 60)
          : undefined,
      };
    }
  } catch {}

  return { coords: [] };
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */
export default function SelectCarrierScreen() {
  // Filter online carriers with location
  const onlineCarriers = carrierDatabase.filter(
    (c) => c.carrier_online && c.latitude && c.longitude
  );
  const router = useRouter();
  const params = useLocalSearchParams();

  const parse = (v: unknown): number | null => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const origin = useMemo<LatLng>(() => {
    const lat = parse(params.sender_latitude ?? params.senderLat);
    const lng = parse(params.sender_longitude ?? params.senderLng);
    return lat !== null && lng !== null
      ? { latitude: lat, longitude: lng }
      : defaultCenter;
  }, [params]);

  const destination = useMemo<LatLng>(() => {
    const lat = parse(params.receiver_latitude ?? params.receiverLat);
    const lng = parse(params.receiver_longitude ?? params.receiverLng);
    return lat !== null && lng !== null
      ? { latitude: lat, longitude: lng }
      : defaultCenter;
  }, [params]);

  const hasBoth = useMemo(
    () =>
      !(
        origin.latitude === defaultCenter.latitude &&
        origin.longitude === defaultCenter.longitude
      ) &&
      !(
        destination.latitude === defaultCenter.latitude &&
        destination.longitude === defaultCenter.longitude
      ),
    [origin, destination]
  );

  /* Base great-circle distance (fallback for pill/ETAs) */
  const crowKm = useMemo(
    () => kmBetween(origin, destination),
    [origin, destination]
  );

  /* Route polyline + distance/eta (when APIs return) */
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [routeKm, setRouteKm] = useState<number | null>(null);

  /* Build simple, offline carrier cards (we can still show these) */
  const effectiveKm = routeKm ?? crowKm;
  const carriers = useMemo(
    () => [
      {
        key: "walk",
        icon: (
          <MaterialCommunityIcons name="walk" size={24} color={COLOR.text} />
        ),
        title: "Carrier",
        eta: `${minutesFromKm(effectiveKm, SPEEDS.WALK)} min`,
        price: priceFromKmMin(
          effectiveKm,
          minutesFromKm(effectiveKm, SPEEDS.WALK),
          1500
        ),
        description: "On-foot courier",
      },
      {
        key: "bicycle",
        icon: <FontAwesome5 name="bicycle" size={22} color="#d32f2f" />,
        title: "Bicycle Carrier",
        eta: `${minutesFromKm(effectiveKm, SPEEDS.BICYCLE)} min`,
        price: priceFromKmMin(
          effectiveKm,
          minutesFromKm(effectiveKm, SPEEDS.BICYCLE),
          2500
        ),
        description: "Cyclist courier",
      },
      {
        key: "bike",
        icon: <FontAwesome5 name="motorcycle" size={22} color="#0288d1" />,
        title: "Bike Carrier",
        eta: `${minutesFromKm(effectiveKm, SPEEDS.TWO_WHEELER)} min`,
        price: priceFromKmMin(
          effectiveKm,
          minutesFromKm(effectiveKm, SPEEDS.TWO_WHEELER),
          3500
        ),
        description: "Motorbike courier",
      },
      {
        key: "car",
        icon: <FontAwesome5 name="car" size={22} color="#1565c0" />,
        title: "Car Carrier",
        eta: `${minutesFromKm(effectiveKm, SPEEDS.CAR)} min`,
        price: priceFromKmMin(
          effectiveKm,
          minutesFromKm(effectiveKm, SPEEDS.CAR),
          4000
        ),
        description: "Car delivery",
      },
    ],
    [effectiveKm]
  );

  /* Map & fit */
  const mapRef = useRef<MapView | null>(null);
  const didFitRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRoute() {
      if (!hasBoth) return;
      const { coords, distanceKm } = await fetchRoutePolyline(
        origin,
        destination
      );
      if (cancelled) return;

      if (coords.length > 1) {
        setRouteCoords(coords);
        if (typeof distanceKm === "number") setRouteKm(distanceKm);

        if (!didFitRef.current) {
          setTimeout(() => {
            mapRef.current?.fitToCoordinates(coords, {
              edgePadding: { top: 20, right: 10, bottom: 40, left: 10 },
              animated: true,
            });
            didFitRef.current = true;
          }, 60);
        }
      } else {
        setRouteCoords([]);
        setRouteKm(null);
        if (!didFitRef.current) {
          setTimeout(() => {
            mapRef.current?.fitToCoordinates([origin, destination], {
              edgePadding: { top: 20, right: 10, bottom: 40, left: 10 },
              animated: true,
            });
            didFitRef.current = true;
          }, 60);
        }
      }
    }

    loadRoute();
    return () => {
      cancelled = true;
    };
  }, [origin, destination, hasBoth]);

  /* Modal */
  const [modal, setModal] = useState<{
    open: boolean;
    title?: string;
    price?: string;
    eta?: string;
  }>({ open: false });

  const senderAddress = (params.sender_location || params.senderLocation) as
    | string
    | undefined;
  const receiverAddress = (params.receiver_location ||
    params.receiverLocation) as string | undefined;

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
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: origin.latitude,
            longitude: origin.longitude,
            latitudeDelta: 0.005, // closer street-level zoom
            longitudeDelta: 0.005, // closer street-level zoom
          }}
          customMapStyle={darkMapStyle}
          userInterfaceStyle="light"
          showsUserLocation
          showsMyLocationButton
          zoomEnabled={true}
          scrollEnabled={true}
        >
          <Marker coordinate={origin} title="Sender">
            <FontAwesome5 name="map-marker-alt" size={22} color="#27ae60" />
          </Marker>

          <Marker coordinate={destination} title="Receiver">
            <FontAwesome5 name="map-marker-alt" size={22} color="#e74c3c" />
          </Marker>

          {/* Show all online carriers on the map will delete later */}
          {onlineCarriers.map((carrier) => (
            <Marker
              key={carrier.carrier_id}
              coordinate={{
                latitude: carrier.latitude!,
                longitude: carrier.longitude!,
              }}
              title={carrier.carrier_name}
              description={carrier.carrier_type}
            >
              <FontAwesome5 name="user" size={20} color="#2F7E5D" />
            </Marker>
          ))}
          {/*------end of online carriers map markers------*/}

          {/* If we got a turn-by-turn polyline, draw it; else draw a geodesic fallback */}
          {routeCoords.length > 1 ? (
            <Polyline
              coordinates={routeCoords}
              strokeColor={COLOR.brand}
              strokeWidth={3}
              lineCap="round"
              lineJoin="round"
              geodesic
            />
          ) : (
            hasBoth && (
              <Polyline
                coordinates={[origin, destination]}
                geodesic
                strokeColor={COLOR.brand}
                strokeWidth={4}
              />
            )
          )}
        </MapView>

        {/* Distance pill – prefer route length if we have it */}
        <View style={styles.pill}>
          <Text style={styles.pillText}>
            {(routeKm ?? crowKm).toFixed(1)} km
          </Text>
        </View>
      </View>

      {/* Bottom panel with cards */}
      <View style={[styles.panel, { marginTop: -30 }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {carriers.map((c) => (
            <TouchableOpacity
              key={c.key}
              activeOpacity={0.9}
              onPress={() =>
                setModal({
                  open: true,
                  title: c.title,
                  price: c.price,
                  eta: c.eta,
                })
              }
            >
              <View style={styles.card}>
                <View style={styles.iconBox}>{c.icon}</View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{c.title}</Text>
                  <Text style={styles.cardSub}>
                    ETA <Text style={styles.bold}>{c.eta}</Text> away
                  </Text>
                  <Text style={styles.cardDesc}>Package delivery</Text>
                </View>
                <Text style={styles.price}>{c.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Modal */}
      <Modal
        visible={modal.open}
        animationType="fade"
        transparent
        onRequestClose={() => setModal({ open: false })}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModal({ open: false })}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setModal({ open: false })}
            >
              <AntDesign name="close" size={22} color="#000" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{modal.title}</Text>

            <View style={styles.routeBlock}>
              <View style={styles.dotCol}>
                <View style={styles.dotStart} />
                <View style={styles.dotLine} />
                <View style={styles.dotEnd} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeText}>
                  Sender:{" "}
                  {senderAddress ??
                    `${origin.latitude.toFixed(5)}, ${origin.longitude.toFixed(
                      5
                    )}`}
                </Text>
                <Text style={styles.routeText}>
                  Receiver:{" "}
                  {receiverAddress ??
                    `${destination.latitude.toFixed(
                      5
                    )}, ${destination.longitude.toFixed(5)}`}
                </Text>
                <Text style={styles.routeText}>ETA: {modal.eta}</Text>
              </View>
            </View>

            <Text style={styles.costLabel}>Estimated Cost</Text>
            <Text style={styles.costAmount}>{modal.price}</Text>

            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => {
                setModal({ open: false });
                router.push({
                  pathname: "/DeliveryFlow/PairWithCarrier",
                  params: {
                    sender_latitude: origin.latitude,
                    sender_longitude: origin.longitude,
                    receiver_latitude: destination.latitude,
                    receiver_longitude: destination.longitude,
                    sender_location: senderAddress,
                    receiver_location: receiverAddress,
                  },
                });
              }}
            >
              <Text style={styles.selectBtnText}>Select Carrier</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.bg },

  backBtn: {
    position: "absolute",
    top: 48,
    left: 20,
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },

  mapContainer: {
    height: "45%",
    backgroundColor: COLOR.mapTop,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },
  map: { width: "100%", height: "100%" },

  pill: {
    position: "absolute",
    right: 20,
    top: 20,
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    elevation: 5,
  },
  pillText: { fontWeight: "bold", fontSize: 16 },

  panel: {
    flex: 1,
    backgroundColor: COLOR.panel,
    paddingHorizontal: 15,
    paddingTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  card: {
    backgroundColor: COLOR.cardBg,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  iconBox: {
    marginRight: 12,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    padding: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: COLOR.text },
  cardSub: { fontSize: 13, color: COLOR.sub },
  bold: { fontWeight: "bold", color: COLOR.text },
  cardDesc: { fontSize: 12, color: "#777", marginTop: 2 },
  price: { fontWeight: "bold", fontSize: 16, color: COLOR.text },

  /* Modal */
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    position: "relative",
  },
  modalClose: { position: "absolute", right: 15, top: 15, zIndex: 10 },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },

  routeBlock: { flexDirection: "row", marginBottom: 18 },
  dotCol: { alignItems: "center", marginRight: 10 },
  dotStart: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#000",
    marginBottom: 3,
  },
  dotLine: { width: 2, height: 22, backgroundColor: COLOR.panel },
  dotEnd: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLOR.panel,
    marginTop: 3,
  },
  routeText: { marginBottom: 5, fontSize: 13, color: "#333" },

  costLabel: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  costAmount: { fontSize: 22, fontWeight: "bold", marginBottom: 18 },

  selectBtn: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  selectBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

// Popular dark map style (Uber-like)
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1b1b1b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8a8a" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#373737" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3c3c3c" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#3c3c3c" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#212121" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d3d3d" }],
  },
];
