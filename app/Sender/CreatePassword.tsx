import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";

const CreatePassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const router = useRouter();
  const [secureText, setSecureText] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [success, setSuccess] = useState(false);

  const isMatch = password.length === 6 && password === confirm;

  const handleSubmit = () => {
    if (!/^\d{6}$/.test(password)) {
      alert("Password must be exactly 6 digits.");
      return;
    }
    if (!isMatch) {
      alert("Passwords do not match.");
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      router.replace("/Sender/AccountSuccessful");
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Title */}
      <Text style={styles.title}>Create Password</Text>

      {/* Password Label */}
      <Text style={styles.label}>Enter Password</Text>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          secureTextEntry={secureText}
          value={password}
          onChangeText={(val) =>
            setPassword(val.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="Enter 6-digit PIN"
          placeholderTextColor="#000"
          keyboardType="number-pad"
          maxLength={6}
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <Ionicons
            name={secureText ? "eye-off" : "eye"}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password Field */}
      <Text style={styles.label}>Confirm Password</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          secureTextEntry={secureConfirm}
          value={confirm}
          onChangeText={(val) => setConfirm(val.replace(/\D/g, "").slice(0, 6))}
          placeholder="Confirm 6-digit PIN"
          placeholderTextColor="#000"
          keyboardType="number-pad"
          maxLength={6}
        />
        <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)}>
          <Ionicons
            name={secureConfirm ? "eye-off" : "eye"}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      {confirm.length > 0 && !isMatch && (
        <Text style={{ color: "red", marginTop: 8, marginLeft: 8 }}>
          Passwords do not match
        </Text>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, { opacity: isMatch ? 1 : 0.5 }]}
        disabled={!isMatch}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>

      {success && (
        <Text style={{ color: "green", marginTop: 24, textAlign: "center" }}>
          Password set successfully!
        </Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: "#FAFAFA",
    alignItems: "stretch",
    paddingTop: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2B1717",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 35,
  },
  label: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 16,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 50,
    justifyContent: "space-between",
    marginTop: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: "#000",
    letterSpacing: 1,
    opacity: 0.8,
  },
  submitButton: {
    backgroundColor: "#1ABC9C",
    marginTop: 40,
    borderRadius: 20,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default CreatePassword;
