import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
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
          <Text style={styles.drawerTitle}>Delivery Details</Text>
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
});
