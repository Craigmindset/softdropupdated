// Carrier/Login.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, "").slice(0, 11);
    setPhone(digitsOnly);
  };

  const handlePassChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, "").slice(0, 6);
    setPassword(digitsOnly);
  };

  const canSubmit = useMemo(
    () => phone.length === 11 && password.length === 6,
    [phone, password]
  );

  const submit = () => {
    if (!canSubmit) return;
    console.log("Login payload:", { phone, password });
    // TODO: replace with your login handler
  };

  const router = useRouter();

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

        {/* Title */}
        <View style={{ height: 48 }} />
        <Text style={styles.title}>
          Login | <Text style={styles.titleBold}>Carrier&apos;s Account</Text>
        </Text>
        <View style={{ height: 36 }} />

        {/* Phone field */}
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Enter phone number (11 digits)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="08xxxxxxxxx"
              placeholderTextColor="#A7A7AD"
              inputMode="numeric"
              keyboardType="number-pad"
              maxLength={11}
              style={styles.input}
            />
            {phone.length > 0 && (
              <Pressable
                onPress={() => setPhone("")}
                hitSlop={8}
                style={styles.clearBtn}
              >
                <Text style={styles.clearIcon}>×</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Password field */}
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Enter password (6 digits)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={password}
              onChangeText={handlePassChange}
              placeholder="******"
              placeholderTextColor="#A7A7AD"
              inputMode="numeric"
              keyboardType="number-pad"
              secureTextEntry={!showPass}
              maxLength={6}
              style={styles.input}
            />
            <Pressable
              onPress={() => setShowPass((s) => !s)}
              hitSlop={8}
              style={styles.showBtn}
            >
              <MaterialIcons
                name={showPass ? "visibility" : "visibility-off"}
                size={22}
                color="#3B82F6"
              />
            </Pressable>
          </View>

          <View style={styles.passMetaRow}>
            <Text
              style={styles.passCount}
            >{`${password.length}/6 digits`}</Text>
            <Pressable onPress={() => console.log("Forgot Password")}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>
          </View>
        </View>

        {/* Login button */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.loginBtn, !canSubmit && styles.loginBtnDisabled]}
          onPress={submit}
          disabled={!canSubmit}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footerRow}>
          <View style={{ flex: 1 }} />
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <Pressable onPress={() => router.push("/Carrier/Registration")}>
            <Text style={styles.signUpText}>Sign up</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;

const GREEN = "#21C15A";
const TEXT_DARK = "#222222";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 24 },
  topBar: { height: 44, justifyContent: "center" },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { fontSize: 20, color: TEXT_DARK },
  title: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "600",
    color: TEXT_DARK,
    textAlign: "center",
  },
  titleBold: { fontWeight: "700" },
  fieldBlock: { marginTop: 22 },
  label: { fontSize: 14, color: "#4A4A4A", marginBottom: 8 },
  inputWrapper: {
    position: "relative",
    borderWidth: 1,
    borderColor: "#E5E6EA",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: { fontSize: 16, color: TEXT_DARK, padding: 0 },
  showBtn: { position: "absolute", right: 12, top: 12 },
  clearBtn: { position: "absolute", right: 36, top: 12, zIndex: 1 },
  clearIcon: { fontSize: 18, color: "#A7A7AD", fontWeight: "bold" },
  showText: { fontSize: 14, color: "#3B82F6", fontWeight: "600" },
  passMetaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  passCount: { fontSize: 12, color: "#9CA3AF" },
  forgotText: { fontSize: 13, color: "#3B82F6", fontWeight: "600" },
  loginBtn: {
    marginTop: 28,
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  footerRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  footerText: { fontSize: 14, color: "#6B7280" },
  signUpText: { fontSize: 14, color: "#EF4444", fontWeight: "700" },
});
