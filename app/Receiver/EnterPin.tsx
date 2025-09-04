import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const GREEN = "#21C15A";
const TEXT_DARK = "#222222";
const BOX_BORDER = "#E5E6EA";

const PIN_LENGTH = 4;

const EnterPin = () => {
  const [pin, setPin] = useState("");
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const phone = typeof params.phone === "string" ? params.phone : undefined;

  const handleChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, PIN_LENGTH);
    setPin(digits);
  };

  const canProceed = pin.length === PIN_LENGTH;

  const handleNext = () => {
    if (!canProceed) return;
    if (pin === "1111") {
      router.replace("/Receiver/TrackBoard");
    } else {
      alert("Invalid PIN");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#21C15A",
            borderRadius: 10,
            marginBottom: 24,
            marginTop: 8,
            padding: 12,
            marginHorizontal: 8,
            backgroundColor: "#F7FFF9",
          }}
        >
          <Text
            style={{
              color: "#222",
              fontSize: 15,
              textAlign: "center",
            }}
          >
            Kindly insert the receiver PIN sent to you by the sender. Ensure you
            keep your PIN private to avoid breach.
          </Text>
        </View>
        <Text style={styles.title}>Receiver PIN</Text>
        {/* Optionally show phone number */}
        {phone && (
          <Text
            style={{ textAlign: "center", color: TEXT_DARK, marginBottom: 12 }}
          >
            Receiver: {phone}
          </Text>
        )}
        {/* Hidden input for PIN */}
        <TextInput
          ref={inputRef}
          value={pin}
          onChangeText={handleChange}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={PIN_LENGTH}
          style={styles.hiddenInput}
          autoFocus
        />
        {/* PIN boxes */}
        <Pressable
          style={styles.boxRow}
          onPress={() => inputRef.current?.focus()}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => {
            const char = pin[i] ?? "";
            const isActive = i === pin.length && !canProceed;
            return (
              <View
                key={i}
                style={[
                  styles.box,
                  isActive && styles.boxActive,
                  i === PIN_LENGTH - 1 && { marginRight: 0 },
                ]}
              >
                <Text style={styles.boxText}>{char ? "•" : ""}</Text>
              </View>
            );
          })}
        </Pressable>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleNext}
          disabled={!canProceed}
          style={[styles.cta, !canProceed && styles.ctaDisabled]}
        >
          <Text style={styles.ctaText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: TEXT_DARK,
    textAlign: "center",
    marginBottom: 32,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
  boxRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
  },
  box: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BOX_BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    marginRight: 8,
  },
  boxActive: {
    borderColor: "#7EC8A6",
  },
  boxText: {
    fontSize: 20,
    color: TEXT_DARK,
  },
  cta: {
    backgroundColor: GREEN,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32, // Added marginBottom for spacing
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});

export default EnterPin;
