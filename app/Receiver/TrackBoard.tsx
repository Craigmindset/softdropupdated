import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
} from "react-native-reanimated";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_MIN_HEIGHT = SCREEN_HEIGHT * 0.6;
const DRAWER_MAX_HEIGHT = SCREEN_HEIGHT * 0.95;

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
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [{ color: "#4e4e4e" }],
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

export default function TrackBoard() {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === "granted");
      if (status === "granted") {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
      setLoading(false);
    })();
  }, []);

  // Center map on user location whenever it changes
  useEffect(() => {
    if (userLocation) {
      setMapRegion({
        ...userLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            ...userLocation,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          },
          500
        );
      }
    }
  }, [userLocation]);

  const translateY = useSharedValue(0);
  const maxTranslate = DRAWER_MIN_HEIGHT - 80;

  const gestureHandler =
    useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onStart: (_, ctx: any) => {
        ctx.startY = translateY.value;
      },
      onActive: (event, ctx: any) => {
        let nextY = ctx.startY + event.translationY;
        nextY = Math.max(0, Math.min(nextY, maxTranslate));
        translateY.value = nextY;
      },
      onEnd: () => {
        translateY.value =
          translateY.value > maxTranslate / 2
            ? withSpring(maxTranslate)
            : withSpring(0);
      },
    });

  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: DRAWER_MIN_HEIGHT,
  }));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Requesting location permission...</Text>
      </View>
    );
  }

  if (!hasLocationPermission) {
    return (
      <View style={styles.center}>
        <Text>Location permission is required to show the map.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Map */}
      <View style={StyleSheet.absoluteFillObject}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          customMapStyle={darkMapStyle}
          showsUserLocation
          showsMyLocationButton
        >
          {userLocation && (
            <Marker
              coordinate={userLocation}
              title="You are here"
              pinColor="red"
            />
          )}
        </MapView>
      </View>

      {/* Drawer */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.drawer, animatedDrawerStyle]}>
          <View style={styles.drawerHandle} />

          {/* Carrier Profile Row + Scan icon on the right */}
          <View style={styles.profileRow}>
            <Image
              source={require("../../assets/images/placeholder-avatar.png")}
              style={styles.avatar}
            />

            <View style={styles.profileInfo}>
              <View style={styles.infoRow}>
                <FontAwesome
                  name="user"
                  size={16}
                  color="#fff"
                  style={styles.infoIcon}
                />
                <Text style={styles.profileName}>John Doe</Text>
              </View>
              <View style={styles.infoRow}>
                <FontAwesome
                  name="phone"
                  size={16}
                  color="#fff"
                  style={styles.infoIcon}
                />
                <Text style={styles.profilePhone}>08012345678</Text>
              </View>
              <View style={styles.infoRow}>
                <FontAwesome
                  name="star"
                  size={16}
                  color="#fff"
                  style={styles.infoIcon}
                />
                <Text style={styles.ratingLabel}>Rating: </Text>
                <Text style={styles.ratingValue}>4.8</Text>
              </View>
            </View>

            {/* NEW: Scan Icon (top-right of card) */}
            <TouchableOpacity
              style={styles.scanIconBtn}
              onPress={() => {
                /* open scanner */
              }}
            >
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={22}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Package Details */}
          <View style={styles.packageHeaderRow}>
            <FontAwesome
              name="archive"
              size={16}
              color="#14532d"
              style={styles.packageIcon}
            />
            <Text style={styles.packageTitle}>Package Details</Text>
          </View>

          {/* Standardized row: [iconCell][labelCell][valueCell] */}
          <View style={styles.packageRow}>
            <View style={styles.iconCell}>
              <FontAwesome
                name="id-card"
                size={16}
                color={styles.packageIcon.color}
              />
            </View>
            <Text style={styles.labelCell}>Deliver-ID:</Text>
            <Text style={styles.valueCell}>SD1234567890</Text>
          </View>

          <View style={styles.packageRow}>
            <View style={styles.iconCell}>
              <FontAwesome
                name="user-circle"
                size={16}
                color={styles.packageIcon.color}
              />
            </View>
            <Text style={styles.labelCell}>Sender Name:</Text>
            <Text style={styles.valueCell}>Mathew Wealth</Text>
          </View>

          <View style={styles.packageRow}>
            <View style={styles.iconCell}>
              <MaterialCommunityIcons
                name="motorbike"
                size={16}
                color={styles.packageIcon.color}
              />
            </View>
            <Text style={styles.labelCell}>Item Type:</Text>
            <Text style={styles.valueCell}>Fragile</Text>
          </View>

          <View style={styles.packageRow}>
            <View style={styles.iconCell}>
              <MaterialCommunityIcons
                name="piggy-bank"
                size={16}
                color={styles.packageIcon.color}
              />
            </View>
            <Text style={styles.labelCell}>Paid Status:</Text>
            <Text style={styles.valueCell}>Escrow</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Scan to Confirm Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.scanButton}
              activeOpacity={0.7}
              onPress={() => router.push("/Receiver/ScanItem")}
            >
              <Text style={styles.scanButtonText}>Confirm Item</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const LABEL_WIDTH = 160; // keeps all labels aligned
const ICON_WIDTH = 22; // keeps all icons aligned

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  drawer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1abc34",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  drawerHandle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 12,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: "#fff",
  },
  profileInfo: { flex: 1, justifyContent: "center" },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  infoIcon: { marginRight: 6 },
  profileName: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  profilePhone: { fontSize: 14, color: "#e0e0e0", marginTop: 2 },
  ratingLabel: { fontSize: 13, color: "#e0e0e0" },
  ratingValue: { fontSize: 13, color: "#fff", fontWeight: "bold" },

  // NEW: scan icon button in header
  scanIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    marginLeft: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 16,
    width: "100%",
  },

  packageHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  packageIcon: { marginRight: 2, color: "#f5f5f7" },
  packageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dcebe2ff",
    marginLeft: 4,
  },

  // Standardized cells
  packageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    width: "100%",
  },
  iconCell: {
    width: ICON_WIDTH,
    alignItems: "center",
    marginRight: 6,
  },
  labelCell: {
    width: LABEL_WIDTH,
    fontSize: 14,
    color: "#444",
    textAlign: "left",
  },
  valueCell: {
    flex: 1,
    fontSize: 14,
    color: "#222",
    fontWeight: "bold",
    textAlign: "right",
  },

  buttonContainer: { alignItems: "center", marginTop: 16, marginBottom: 8 },
  scanButton: {
    backgroundColor: "#14532d",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
