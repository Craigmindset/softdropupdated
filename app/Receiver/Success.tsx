import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";

const Success = () => {
  const router = useRouter();
  const animationRef = useRef<LottieView>(null);

  const handleAnimationFinish = () => {
    // Clear navigation stack before navigating to Review
    // If router.reset is available in your Expo Router version, use it:
    // router.reset({ index: 0, routes: [{ name: '/Receiver/Review' }] });
    // Otherwise, use replace (prevents back navigation):
    router.replace("/Receiver/Review");
  };

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={require("../../assets/images/Animation - 1748794352462.json")}
        autoPlay
        loop={false}
        style={{ width: 180, height: 180 }}
        onAnimationFinish={handleAnimationFinish}
      />
      <Text style={styles.successText}>Successful</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  successText: {
    marginTop: 24,
    fontSize: 22,
    fontWeight: "bold",
    color: "#0B4D1C",
    textAlign: "center",
  },
});

export default Success;
