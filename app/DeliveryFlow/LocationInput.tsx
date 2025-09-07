// app/DeliveryFlow/LocationInput.tsx
import React, { useState } from "react";
import * as Location from "expo-location";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar as RNStatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";

/** Same palette as SendParcel */
const COLOR = {
  bg: "#0C1515",
  text: "#E8F1EE",
  sub: "#A8B7B2",
  card: "#0F2020",
  line: "rgba(232, 241, 238, 0.10)",
  green: "#2F7E5D",
  greenSoft: "#1D5E46",
  inputBg: "#0E1A1A",
  inputBorder: "rgba(232, 241, 238, 0.20)",
  btn: "#1ABC86",
  sheet: "#0E1A1A",
};

const LocationInput: React.FC = () => {
  const router = useRouter();

  const [senderLocation, setSenderLocation] = useState("");
  const [receiverLocation, setReceiverLocation] = useState("");

  const ready =
    senderLocation.trim().length > 0 && receiverLocation.trim().length > 0;

  const autofillSenderFromGPS = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location permission is required to autofill your address."
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync(loc.coords);
      if (geocode && geocode.length > 0) {
        const { name, street, city, region, country } = geocode[0];
        const address = [name, street, city, region, country]
          .filter(Boolean)
          .join(", ");
        setSenderLocation(address);
      } else {
        setSenderLocation(`${loc.coords.latitude}, ${loc.coords.longitude}`);
      }
    } catch (err) {
      Alert.alert("Error", "Unable to get current location.");
    }
  };

  const goNext = () => {
    if (!ready) return;
    router.push({
      pathname: "/DeliveryFlow/SelectCarrier",
      params: { sender: senderLocation, receiver: receiverLocation },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RNStatusBar backgroundColor={COLOR.bg} barStyle="light-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.8}
          >
            <MCI name="arrow-left" size={22} color={COLOR.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { marginTop: 32 }]}>Enter locations</Text>
        </View>

        {/* Sender */}
        <Text style={styles.label}>Sender location</Text>
        <View style={styles.inputWrap}>
          <TextInput
            placeholder="Enter sender location"
            placeholderTextColor={COLOR.sub}
            value={senderLocation}
            onChangeText={setSenderLocation}
            style={[styles.input, { paddingRight: 70 }]}
          />
          <TouchableOpacity
            style={styles.inputIcon}
            onPress={autofillSenderFromGPS}
          >
            <MCI name="map-marker-outline" size={18} color={COLOR.sub} />
          </TouchableOpacity>
          {senderLocation.length > 0 && (
            <TouchableOpacity
              style={[styles.inputIcon, { right: 40 }]}
              onPress={() => setSenderLocation("")}
            >
              <MCI name="close-circle" size={18} color={COLOR.sub} />
            </TouchableOpacity>
          )}
        </View>

        {/* Receiver */}
        <Text style={[styles.label, { marginTop: 6 }]}>Receiver location</Text>
        <View style={styles.inputWrap}>
          <TextInput
            placeholder="Enter receiver location"
            placeholderTextColor={COLOR.sub}
            value={receiverLocation}
            onChangeText={setReceiverLocation}
            style={[styles.input, { paddingRight: 70 }]}
          />
          <MCI
            name="map-marker-outline"
            size={18}
            color={COLOR.sub}
            style={styles.inputIcon}
          />
          {receiverLocation.length > 0 && (
            <TouchableOpacity
              style={[styles.inputIcon, { right: 40 }]}
              onPress={() => setReceiverLocation("")}
            >
              <MCI name="close-circle" size={18} color={COLOR.sub} />
            </TouchableOpacity>
          )}
        </View>

        {/* Next */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.nextBtn, !ready && { opacity: 0.5 }]}
          disabled={!ready}
          onPress={goNext}
        >
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LocationInput;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR.bg },
  container: { flex: 1, paddingHorizontal: 18 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 30,
    marginBottom: 18,
  },
  backBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR.card,
  },
  title: { color: COLOR.text, fontSize: 20, fontWeight: "700" },

  label: {
    color: COLOR.text,
    marginBottom: 8,
    marginTop: 6,
    fontWeight: "600",
  },

  inputWrap: {
    backgroundColor: COLOR.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.inputBorder,
    marginBottom: 12,
  },
  input: {
    color: COLOR.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
  },
  inputIcon: { position: "absolute", right: 12, top: 14 },

  nextBtn: {
    backgroundColor: COLOR.btn,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
  },
  nextText: { color: "#03312A", fontWeight: "800", fontSize: 16 },
});
