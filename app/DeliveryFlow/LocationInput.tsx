// app/DeliveryFlow/LocationInput.tsx
import "react-native-get-random-values";

import React, { useState } from "react";
import * as Location from "expo-location";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar as RNStatusBar,
  TextInput,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import CustomPlacesAutocomplete from "../../components/CustomPlacesAutocomplete";
import { GOOGLE_MAPS_APIKEY } from "../../constants/Keys";

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
  // Shared autocomplete state
  const [activeField, setActiveField] = useState<"sender" | "receiver" | null>(
    null
  );
  const [autocompleteValue, setAutocompleteValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  // Fetch suggestions function
  const fetchSuggestions = async (input: string) => {
    if (!input || input.length < 3) return [];
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${GOOGLE_MAPS_APIKEY}&language=en&components=country:NG`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data.predictions || [];
    } catch (e) {
      return [];
    }
  };
  const router = useRouter();

  const [senderLocation, setSenderLocation] = useState("");
  const [receiverLocation, setReceiverLocation] = useState("");

  const ready =
    senderLocation.trim().length > 0 && receiverLocation.trim().length > 0;

  const autofillSenderFromGPS = async () => {
    try {
      console.log("[PIN ICON] Clicked: Starting autofillSenderFromGPS");
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("[PIN ICON] Location permission status:", status);
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location permission is required to autofill your address."
        );
        console.log("[PIN ICON] Permission denied");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      console.log("[PIN ICON] Location fetched:", loc);
      const geocode = await Location.reverseGeocodeAsync(loc.coords);
      console.log("[PIN ICON] Geocode result:", geocode);
      if (Array.isArray(geocode) && geocode.length > 0 && geocode[0]) {
        const { name, street, city, region, country } = geocode[0] || {};
        const parts = [name, street, city, region, country].filter(Boolean);
        setSenderLocation(parts.join(", "));
        console.log("[PIN ICON] Sender location set:", parts.join(", "));
      } else {
        setSenderLocation(`${loc.coords.latitude}, ${loc.coords.longitude}`);
        console.log(
          "[PIN ICON] Sender location set (coords):",
          `${loc.coords.latitude}, ${loc.coords.longitude}`
        );
      }
    } catch (err) {
      Alert.alert("Error", "Unable to get current location.");
      console.log("[PIN ICON] Error:", err);
    }
  };

  // Helper: geocode address to coordinates using Google Geocoding API
  async function geocodeAddress(
    address: string
  ): Promise<{ latitude: number; longitude: number } | null> {
    if (!address) return null;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${GOOGLE_MAPS_APIKEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (
        data.results &&
        data.results[0] &&
        data.results[0].geometry &&
        data.results[0].geometry.location
      ) {
        return {
          latitude: data.results[0].geometry.location.lat,
          longitude: data.results[0].geometry.location.lng,
        };
      }
    } catch (e) {
      // fallback
    }
    return null;
  }

  const goNext = async () => {
    if (!ready) return;
    // Geocode both addresses
    const senderCoords = await geocodeAddress(senderLocation);
    const receiverCoords = await geocodeAddress(receiverLocation);
    if (!senderCoords || !receiverCoords) {
      Alert.alert(
        "Error",
        "Could not geocode one or both addresses. Please check your input."
      );
      return;
    }
    // Pass both address and coordinates as params
    router.push({
      pathname: "/DeliveryFlow/SelectCarrier",
      params: {
        sender_location: senderLocation,
        receiver_location: receiverLocation,
        sender_latitude: senderCoords.latitude,
        sender_longitude: senderCoords.longitude,
        receiver_latitude: receiverCoords.latitude,
        receiver_longitude: receiverCoords.longitude,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RNStatusBar backgroundColor={COLOR.bg} barStyle="light-content" />
      <View style={styles.container}>
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

        {/* Sender & Receiver Inputs (closer together) */}
        <Text style={styles.label}>Sender location</Text>
        <View style={[styles.inputWrap, { marginBottom: 8, zIndex: 3 }]}>
          {/* Reduced spacing */}
          <TextInput
            value={
              activeField === "sender" ? autocompleteValue : senderLocation
            }
            onFocus={() => {
              setActiveField("sender");
              setAutocompleteValue(senderLocation);
            }}
            onChangeText={async (text) => {
              setAutocompleteValue(text);
              setSenderLocation(text);
              if (activeField === "sender" && text.length >= 3) {
                const results = await fetchSuggestions(text);
                setSuggestions(results);
                setShowDropdown(true);
              } else {
                setShowDropdown(false);
              }
            }}
            placeholder="Enter sender location"
            style={styles.input}
            placeholderTextColor={COLOR.sub}
            returnKeyType="next"
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
              onPress={() => {
                setSenderLocation("");
                setAutocompleteValue("");
              }}
            >
              <MCI name="close-circle" size={18} color={COLOR.sub} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.label}>Receiver location</Text>
        <View
          style={[
            styles.inputWrap,
            { marginBottom: 8, zIndex: 2, position: "relative" },
          ]}
        >
          {/* Reduced spacing */}
          <TextInput
            value={
              activeField === "receiver" ? autocompleteValue : receiverLocation
            }
            onFocus={() => {
              setActiveField("receiver");
              setAutocompleteValue(receiverLocation);
            }}
            onChangeText={async (text) => {
              setAutocompleteValue(text);
              setReceiverLocation(text);
              if (activeField === "receiver" && text.length >= 3) {
                const results = await fetchSuggestions(text);
                setSuggestions(results);
                setShowDropdown(true);
              } else {
                setShowDropdown(false);
              }
            }}
            placeholder="Enter receiver location"
            style={styles.input}
            placeholderTextColor={COLOR.sub}
            returnKeyType="done"
          />
          {receiverLocation.length > 0 && (
            <TouchableOpacity
              style={[styles.inputIcon, { right: 40 }]}
              onPress={() => {
                setReceiverLocation("");
                setAutocompleteValue("");
              }}
            >
              <MCI name="close-circle" size={18} color={COLOR.sub} />
            </TouchableOpacity>
          )}
        </View>

        {/* Shared Autocomplete Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <View style={styles.sharedDropdown}>
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    if (activeField === "sender") {
                      setSenderLocation(item.description);
                    } else {
                      setReceiverLocation(item.description);
                    }
                    setAutocompleteValue(item.description);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>
                    {item.description}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Next */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.nextBtn, !ready && { opacity: 0.5 }]}
          disabled={!ready}
          onPress={goNext}
        >
          <Text style={styles.nextText}>Find Carrier</Text>
        </TouchableOpacity>
      </View>
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

  /** extra vertical spacing between fields */
  block: { marginBottom: 8 }, // Reduce spacing between inputs
  sharedDropdown: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 210, // Adjust as needed to appear below both inputs
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 12,
    zIndex: 9999,
    maxHeight: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownItemText: {
    color: "#222",
    fontSize: 14,
  },

  inputWrap: {
    backgroundColor: COLOR.inputBg,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: COLOR.inputBorder,
    // ensure the suggestions list can overlay the next elements
    overflow: "visible",
  },
  input: {
    color: "#fff", // Ensure input text is white
    backgroundColor: COLOR.inputBg,
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
    marginTop: 50, // more space above the button
    marginBottom: 16,
  },
  nextText: { color: "#03312A", fontWeight: "800", fontSize: 16 },
});
