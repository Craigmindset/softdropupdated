import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
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
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_MIN_HEIGHT = SCREEN_HEIGHT * 0.6;
const DRAWER_MAX_HEIGHT = SCREEN_HEIGHT * 0.95;
const MAP_MIN_HEIGHT = SCREEN_HEIGHT * 0.4;

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

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === "granted");
      setLoading(false);
    })();
  }, []);

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

  const region = {
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Requesting location permission...</Text>
      </View>
    );
  }

  if (!hasLocationPermission) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Location permission is required to show the map.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      {/* Map area */}
      <View style={StyleSheet.absoluteFillObject}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          customMapStyle={darkMapStyle}
          showsUserLocation
          showsMyLocationButton
        />
      </View>
      {/* Drawer */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.drawer, animatedDrawerStyle]}>
          <View style={styles.drawerHandle} />
          {/* Carrier Profile Section */}
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
          </View>
          {/* Divider */}
          <View style={styles.divider} />
          {/* Package Details Section */}
          <View style={styles.packageHeaderRow}>
            <FontAwesome
              name="archive"
              size={16}
              color="#14532d"
              style={styles.packageIcon}
            />
            <Text style={styles.packageTitle}>Package Details</Text>
          </View>
          <View style={styles.packageInfoRow}>
            <FontAwesome
              name="id-card"
              size={16}
              color={styles.packageIcon.color}
              style={styles.packageIcon}
            />
            <Text style={styles.packageLabel}>Deliver-ID:</Text>
            <Text style={styles.packageValue}>SD1234567890</Text>
          </View>
          <View style={styles.packageInfoRow}>
            <FontAwesome
              name="user-circle"
              size={16}
              color={styles.packageIcon.color}
              style={styles.packageIcon}
            />
            <Text style={styles.packageLabel}>Sender Name:</Text>
            <Text style={styles.packageValue}>Mathew Wealth</Text>
          </View>
          <View style={styles.packageInfoRow}>
            <MaterialCommunityIcons
              name="motorbike"
              size={16}
              color={styles.packageIcon.color}
              style={styles.packageIcon}
            />
            <Text style={styles.packageLabel}>Item Type:</Text>
            <Text style={styles.packageValue}>Fragile</Text>
          </View>
          <View style={styles.packageInfoRow}>
            <MaterialCommunityIcons
              name="piggy-bank"
              size={16}
              color={styles.packageIcon.color}
              style={styles.packageIcon}
            />
            <Text style={styles.packageLabel}>Paid Status:</Text>
            <Text style={styles.packageValue}>Escrow</Text>
          </View>
          {/* ...drawer content here... */}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  drawer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1abc34", // green
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
  drawerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
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
    marginRight: 32, // increased space between avatar and profile info
    backgroundColor: "#fff",
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  profilePhone: {
    fontSize: 14,
    color: "#e0e0e0",
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  ratingLabel: {
    fontSize: 13,
    color: "#e0e0e0",
  },
  ratingValue: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  infoIcon: {
    marginRight: 6,
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
  packageIcon: {
    marginRight: 2,
    color: "#f5f5f7", // smoky white
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dcebe2ff",
    marginLeft: 4,
  },
  packageInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    width: "100%",
    // marginLeft removed for flush alignment
  },
  packageLabel: {
    fontSize: 14,
    color: "#444",
    marginRight: 2,
    minWidth: 190, // consistent for all
    flexShrink: 1,
    textAlign: "left",
  },
  packageValue: {
    fontSize: 14,
    color: "#222",
    fontWeight: "bold",
    flexShrink: 1,
    textAlign: "right",
  },
});
