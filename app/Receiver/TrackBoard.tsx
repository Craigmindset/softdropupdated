import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
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
        if (translateY.value > maxTranslate / 2) {
          translateY.value = withSpring(maxTranslate);
        } else {
          translateY.value = withSpring(0);
        }
      },
    });

  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: DRAWER_MIN_HEIGHT,
  }));

  const animatedMapStyle = useAnimatedStyle(() => ({
    height: SCREEN_HEIGHT - (DRAWER_MIN_HEIGHT - translateY.value),
    zIndex: -1,
  }));

  // Default map region (Lagos, Nigeria)
  const region = {
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      {/* Map area */}
      <Animated.View style={[styles.map, animatedMapStyle]}>
        <MapView
          style={{ flex: 1 }}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton
          // Google API key is set in app.json or via .env for native builds
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
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
