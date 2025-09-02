// app/Carrier/ScanningScreen.tsx
import React, { useEffect, useMemo, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedProps,
  runOnJS,
} from "react-native-reanimated";

const GREEN = "#21C15A";
const TEXT = "#222222";
const MUTED = "#7A7F87";

const SIZE = 240; // image circle size like the mock
const STROKE = 8; // ring thickness
const R = (SIZE + STROKE) / 2; // ring radius (slightly larger than image)
const CIRC = 2 * Math.PI * R;
const DURATION_MS = 10_000; // 10s

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ScanningScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri?: string }>(); // photoUri passed in
  const progress = useSharedValue(0);

  // Simulate/trigger server verification in parallel to the ring animation.
  // Replace this with your real API call (POST the `uri` or the uploaded ID)
  const verifyRef = useRef<{ done: boolean; match: boolean }>({
    done: false,
    match: false,
  });

  // Kick off the verification "request"
  useEffect(() => {
    let isMounted = true;

    async function verifyIdentity(photoUri?: string) {
      try {
        // TODO: upload or send `photoUri`/blob to your server here
        // Example: const res = await fetch("https://api.yourapp.com/verify", {...})
        // Simulate 1.5–3.5s server time
        const wait = Math.floor(1500 + Math.random() * 2000);
        await new Promise((r) => setTimeout(r, wait));

        if (!isMounted) return;
        // Toggle this logic with your real API result
        verifyRef.current = { done: true, match: true };
      } catch (e) {
        if (!isMounted) return;
        verifyRef.current = { done: true, match: false };
      }
    }

    verifyIdentity(typeof uri === "string" ? uri : undefined);

    return () => {
      isMounted = false;
    };
  }, [uri]);

  // Animate the ring for 10s. When it completes, decide where to route.
  useEffect(() => {
    progress.value = 0;

    // run the timing animation
    progress.value = withTiming(1, { duration: DURATION_MS }, (finished) => {
      if (!finished) return;

      // When the ring closes, we only proceed to Success if the server matched.
      // If verification hasn't finished yet, poll a few times for completion.
      runOnJS(onRingComplete)();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRingComplete = () => {
    const start = Date.now();
    const poll = () => {
      const { done, match } = verifyRef.current;
      if (done) {
        if (match) {
          router.replace("/Carrier/Success"); // route to your success screen
        } else {
          // If you have a failure screen, navigate there instead:
          // router.replace("/Carrier/Failure");
          // For now we can just go back or stay; here we’ll go back:
          router.back();
        }
        return;
      }
      // small safety timeout (max ~3s waiting after the ring)
      if (Date.now() - start > 3000) {
        router.back();
        return;
      }
      requestAnimationFrame(poll);
    };
    poll();
  };

  // Reanimated prop for the progress stroke
  const animatedProps = useAnimatedProps(() => {
    // strokeDashoffset decreases as progress increases (so ring fills up)
    return {
      strokeDashoffset: CIRC * (1 - progress.value),
    };
  });

  // Precompute ring center
  const { cx, cy } = useMemo(() => ({ cx: R, cy: R }), []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* The circular avatar with ring */}
        <View style={styles.ringWrap}>
          {/* The photo */}
          <Image
            source={
              typeof uri === "string"
                ? { uri }
                : // fallback (optional)
                  require("../../assets/images/placeholder-avatar.png")
            }
            resizeMode="cover"
            style={styles.photo}
          />

          {/* Progress ring sits on top */}
          <Svg
            width={R * 2}
            height={R * 2}
            style={styles.ringSvg}
            viewBox={`0 0 ${R * 2} ${R * 2}`}
          >
            {/* Background track */}
            <Circle
              cx={cx}
              cy={cy}
              r={R}
              stroke="#E6E9EE"
              strokeWidth={STROKE}
              fill="transparent"
            />

            {/* Animated progress arc */}
            <AnimatedCircle
              cx={cx}
              cy={cy}
              r={R}
              stroke={GREEN}
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={`${CIRC}, ${CIRC}`}
              animatedProps={animatedProps}
              // Start the arc at ~-90deg so it grows clockwise from the top
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          </Svg>
        </View>

        {/* Copy like the mock */}
        <Text style={styles.title}>Scanning...</Text>
        <Text style={styles.subtitle}>Please wait for the ring to close</Text>

        {/* Optional tiny spinner to reassure */}
        <ActivityIndicator
          style={{ marginTop: 16 }}
          size="small"
          color={MUTED}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 32,
    backgroundColor: "#FFF",
  },
  ringWrap: {
    width: SIZE + STROKE * 2,
    height: SIZE + STROKE * 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  photo: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },
  ringSvg: {
    position: "absolute",
  },
  title: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: "700",
    color: TEXT,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: MUTED,
  },
});
