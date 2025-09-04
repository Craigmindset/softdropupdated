import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  FlatList,
  Platform,
  Alert,
  ToastAndroid,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

const SUGGESTIONS = [
  { label: "On time delivery", type: "good" },
  { label: "Friendly carrier", type: "good" },
  { label: "Package handled with care", type: "good" },
  { label: "Went above and beyond", type: "good" },
  { label: "Late delivery", type: "bad" },
  { label: "Rude behavior", type: "bad" },
  { label: "Damaged package", type: "bad" },
  { label: "Unprofessional", type: "bad" },
];

const Review = () => {
  const router = useRouter();
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSuggestionToggle = (label: string) => {
    setSelectedSuggestions((prev) => (prev[0] === label ? [] : [label]));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    if (Platform.OS === "android") {
      ToastAndroid.show("Thank You", ToastAndroid.SHORT);
    } else {
      Alert.alert("Thank You");
    }
    setTimeout(() => {
      setSubmitting(false);
      // Reset navigation stack to /ScreenDivision
      router.replace("/ScreenDivision");
      // If router.reset is available, use it for a true reset:
      // router.reset({ index: 0, routes: [{ name: '/ScreenDivision' }] });
    }, 800);
  };

  const handleSkip = () => {
    // Reset navigation stack to /ScreenDivision
    router.replace("/ScreenDivision");
    // If router.reset is available, use it for a true reset:
    // router.reset({ index: 0, routes: [{ name: '/ScreenDivision' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate Your Carrier</Text>
      <Text style={styles.subtitle}>How was your delivery experience?</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i)}>
            <MaterialIcons
              name={i <= rating ? "star" : "star-border"}
              size={36}
              color={i <= rating ? "#FFD600" : "#C9C9C9"}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.suggestionTitle}>What stood out?</Text>
      <View style={{ width: "100%" }}>
        <FlatList
          data={SUGGESTIONS}
          keyExtractor={(item) => item.label}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          style={{ marginBottom: 24 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSuggestionToggle(item.label)}
              style={[
                styles.suggestionBtn,
                selectedSuggestions.includes(item.label)
                  ? item.type === "good"
                    ? styles.suggestionGoodActive
                    : styles.suggestionBadActive
                  : styles.suggestionInactive,
              ]}
            >
              <Text style={styles.suggestionText}>{item.label}</Text>
            </Pressable>
          )}
        />
      </View>
      <TouchableOpacity
        style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitBtnText}>Submit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipBtnText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    // Removed alignItems and justifyContent for better FlatList layout
  },
  title: {
    fontSize: 22,
    fontWeight: "500",
    color: "#222",
    marginBottom: 8,
    marginTop: 50,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 18,
  },
  star: {
    marginHorizontal: 4,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 10,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  suggestionBtn: {
    flex: 1,
    margin: 4,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    // Removed minWidth for better responsiveness
  },
  suggestionGoodActive: {
    backgroundColor: "#E8F5E9",
    borderColor: "#21C15A",
    borderWidth: 2,
  },
  suggestionBadActive: {
    backgroundColor: "#FFEBEE",
    borderColor: "#FF5252",
    borderWidth: 2,
  },
  suggestionInactive: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
    textAlign: "center",
  },
  submitBtn: {
    backgroundColor: "#21C15A",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 60,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
  },
  skipBtn: {
    marginTop: 2,
    padding: 8,
  },
  skipBtnText: {
    color: "#888",
    fontSize: 15,
    textDecorationLine: "underline",
  },
});

export default Review;
