import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function ScreenDivision() {
  console.log("ScreenDivision component rendered");
  const colorScheme = useColorScheme();

  const handleOptionPress = (option: string) => {
    if (option === "send") {
      router.push("/");
    } else {
      // TODO: Implement navigation for other options
      console.log("Selected option:", option);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <LottieView
        source={require("@/assets/images/smiles.json")}
        autoPlay
        loop
        style={styles.image}
      />
      <Text style={styles.title}>What would you like to do today?</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/")}>
        <Text style={styles.buttonText}> Send a parcel</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/Carrier/Login")}
      >
        <Text style={styles.buttonText}>Become a Carrier</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleOptionPress("receive")}
      >
        <Text style={styles.buttonText}>Receive a Parcel</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        softdrop | Insurance Partner{" "}
        <Text style={styles.highlight}>CornerStone </Text>
      </Text>
    </View>
  );
}

export default ScreenDivision;

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
    marginBottom: 32,
    resizeMode: "contain",
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "medium",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 1,
    marginBottom: 16,
    backgroundColor: "black",

    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    color: "white",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    fontSize: 12,
    textAlign: "center",
  },
  highlight: {
    color: Colors.light.tint,
  },
});
