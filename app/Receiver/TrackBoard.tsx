import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import * as Location from 'expo-location';
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

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_MIN_HEIGHT = SCREEN_HEIGHT * 0.6;
const DRAWER_MAX_HEIGHT = SCREEN_HEIGHT * 0.95;
const MAP_MIN_HEIGHT = SCREEN_HEIGHT * 0.4;

export default function TrackBoard() {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
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

  // ✅ Clamp to a minimum and remove zIndex:-1 issues
  const animatedMapStyle = useAnimatedStyle(() => {
    const h = SCREEN_HEIGHT - (DRAWER_MIN_HEIGHT - translateY.value);
    return {
      height: Math.max(MAP_MIN_HEIGHT, h),
    };
  });

  const region = {
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Requesting location permission...</Text>
      </View>
    );
  }

  if (!hasLocationPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Location permission is required to show the map.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map area */}
      <Animated.View style={[styles.mapContainer, animatedMapStyle]}>
        <MapView
          style={StyleSheet.absoluteFillObject} // ✅ fill parent
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton
        />
      </Animated.View>

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

  // ✅ No negative zIndex; use absolute fill
  mapContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#e6f0fa",
  },

  drawer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
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
