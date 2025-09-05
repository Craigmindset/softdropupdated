// Sender/EnterOtp.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  phone?: string; // e.g. "+234 821234657"
  onBack?: () => void;
  onNext?: (code: string) => void;
  onResend?: () => void;
  otpLength?: number; // default 6
  resendSeconds?: number; // default 30
};

const GREEN = "#21C15A";
const TEXT_DARK = "#222222";
const MUTED = "#8F95A3";
const BOX_BORDER = "#E5E6EA";

const EnterOtp = ({
  phone: _phone,
  onBack,
  onNext,
  onResend,
  otpLength = 6,
  resendSeconds = 30,
}: Props) => {
  const params = useLocalSearchParams();
  const phone =
    typeof params.phone === "string"
      ? params.phone
      : _phone || "+234 821234657";
  // TODO: Connect to Supabase Auth for real OTP verification later
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(resendSeconds);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();

  // countdown for resend
  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [left]);

  // ensure only digits and max length
  const handleChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, otpLength);
    setCode(digits);
  };

  const canProceed = useMemo(
    () => code.length === otpLength,
    [code, otpLength]
  );

  const handleResend = () => {
    if (left > 0) return;
    setLeft(resendSeconds);
    setCode("");
    onResend?.();
    inputRef.current?.focus();
  };

  const handleNext = () => {
    if (!canProceed) return;
    // Check OTP
    if (code === "111111") {
      router.push({ pathname: "/Sender/Success", params: { phone } });
    } else {
      alert("Invalid OTP");
    }
    onNext?.(code);
  };

  // format mm:ss for timer
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
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

        {/* Instruction */}
        <Text style={styles.instruction}>
          Enter the {otpLength}-digit code sent to{" "}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        {/* Hidden input that actually captures the code */}
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleChange}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={otpLength}
          style={styles.hiddenInput}
          autoFocus
        />

        {/* Boxes (tap anywhere to focus) */}
        <Pressable
          style={styles.boxRow}
          onPress={() => inputRef.current?.focus()}
        >
          {Array.from({ length: otpLength }).map((_, i) => {
            const char = code[i] ?? "";
            const isActive = i === code.length && !canProceed;
            return (
              <View key={i} style={[styles.box, isActive && styles.boxActive]}>
                <Text style={styles.boxText}>{char ? "\u2022" : ""}</Text>
              </View>
            );
          })}
        </Pressable>

        {/* Resend row */}
        <View style={styles.resendRow}>
          <Text
            style={[styles.resendLeft, { color: left > 0 ? MUTED : TEXT_DARK }]}
          >
            {left > 0 ? `Get new code in ${mm}:${ss}` : "Get new code"}
          </Text>
          <Pressable onPress={handleResend} disabled={left > 0}>
            <Text style={[styles.resendRight, left > 0 && { opacity: 0.5 }]}>
              Didn't receive it?
            </Text>
          </Pressable>
        </View>

        {/* Next button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleNext}
          disabled={!canProceed}
          style={[styles.cta, !canProceed && styles.ctaDisabled]}
        >
          <Text style={styles.ctaText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EnterOtp;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  topBar: { height: 44, justifyContent: "center" },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { fontSize: 20, color: TEXT_DARK },

  instruction: {
    marginTop: 30,
    fontSize: 15,
    color: TEXT_DARK,
    textAlign: "center",
  },
  phone: { fontWeight: "700" },

  hiddenInput: {
    // keep off-screen but focusable
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },

  boxRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
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
  },
  boxActive: {
    borderColor: "#7EC8A6",
  },
  boxText: {
    fontSize: 20,
    color: TEXT_DARK,
  },

  resendRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resendLeft: { fontSize: 13 },
  resendRight: { fontSize: 13, color: "#3B82F6", fontWeight: "600" },

  cta: {
    marginTop: 28,
    backgroundColor: GREEN,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
