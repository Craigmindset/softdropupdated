// Sender/Registration.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Registration = () => {
  const [phone, setPhone] = useState("");

  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, "").slice(0, 11);
    setPhone(digitsOnly);
  };

  const canProceed = useMemo(() => phone.length === 11, [phone]);

  const onEnter = () => {
    if (!canProceed) return;
    router.push({ pathname: "/Sender/EnterOtp", params: { phone } });
  };

  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        {/* Back arrow */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backBtn}
          >
            <MaterialIcons
              name="arrow-back-ios-new"
              size={22}
              color="#222"
              style={{
                backgroundColor: "#F3F4F6",
                borderRadius: 18,
                padding: 7,
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>create an account</Text>

        {/* Label */}
        <Text style={styles.label}>Please input your phone number</Text>

        {/* Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            value={phone}
            onChangeText={handlePhoneChange}
            placeholder="Phone number"
            placeholderTextColor="#A7A7AD"
            inputMode="numeric"
            keyboardType="number-pad"
            maxLength={11}
            style={styles.input}
          />
        </View>

        {/* Helper text */}
        <Text style={styles.helper}>
          An OTP will be sent to verify the inputted number.
        </Text>

        {/* Enter button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onEnter}
          disabled={!canProceed}
          style={[styles.cta, !canProceed && styles.ctaDisabled]}
        >
          <Text style={styles.ctaText}>Enter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Registration;

const GREEN = "#21C15A";
const TEXT_DARK = "#222222";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  topBar: {
    height: 44,
    justifyContent: "center",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 20,
    color: TEXT_DARK,
  },
  title: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
    textTransform: "lowercase",
  },
  label: {
    marginTop: 26,
    fontSize: 14,
    color: "#4A4A4A",
  },
  inputWrapper: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E5E6EA",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    fontSize: 16,
    color: TEXT_DARK,
    padding: 0,
  },
  helper: {
    marginTop: 8,
    fontSize: 12,
    color: "#8F95A3",
  },
  cta: {
    marginTop: 28,
    backgroundColor: GREEN,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "capitalize",
  },
});
