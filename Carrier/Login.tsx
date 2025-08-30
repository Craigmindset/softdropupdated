// LoginCarrierScreen.tsx
import { useMemo, useState } from "react";
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
  onBack?: () => void;
  onLogin?: (payload: { phone: string; password: string }) => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
};

export default function Login({
  onBack,
  onLogin,
  onForgotPassword,
  onSignUp,
}: Props) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // keep input strictly digits and max length
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
    onLogin?.({ phone, password });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Top bar with back */}
        <View style={styles.topBar}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Login | <Text style={styles.titleBold}>Carrier&apos;s Account</Text>
        </Text>

        {/* Phone */}
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
          </View>
        </View>

        {/* Password */}
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
              <Text style={styles.showText}>{showPass ? "Hide" : "Show"}</Text>
            </Pressable>
          </View>

          <View style={styles.passMetaRow}>
            <Text
              style={styles.passCount}
            >{`${password.length}/6 digits`}</Text>
            <Pressable onPress={onForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>
          </View>
        </View>

        {/* Login */}
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
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <Pressable onPress={onSignUp}>
            <Text style={styles.signUpText}>Sign up</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const GREEN = "#21C15A";
const GREEN_DARK = "#1DA44E";
const TEXT_DARK = "#222222";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
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
    marginTop: 32,
    fontSize: 22,
    fontWeight: "600",
    color: TEXT_DARK,
    textAlign: "center",
  },
  titleBold: {
    fontWeight: "700",
  },
  fieldBlock: {
    marginTop: 38,
  },
  label: {
    fontSize: 14,
    color: "#4A4A4A",
    marginBottom: 8,
  },
  inputWrapper: {
    position: "relative",
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
  showBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    height: 24,
    justifyContent: "center",
  },
  showText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  passMetaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  passCount: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  forgotText: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "600",
  },
  loginBtn: {
    marginTop: 28,
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  footerRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  signUpText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "700",
  },
});
