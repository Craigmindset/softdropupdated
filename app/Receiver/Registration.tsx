import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";

const Registration = () => {
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const handleContinue = () => {
    if (phone.length === 11) {
      router.push({ pathname: "/Receiver/EnterPin", params: { phone } });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={(val) => setPhone(val.replace(/\D/g, "").slice(0, 11))}
        placeholder="08xxxxxxxxx"
        keyboardType="number-pad"
        maxLength={11}
        placeholderTextColor="#888"
      />
      <TouchableOpacity
        style={[styles.button, phone.length !== 11 && styles.buttonDisabled]}
        disabled={phone.length !== 11}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#222",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 18,
    marginBottom: 24,
    color: "#222",
    backgroundColor: "#F7F7F7",
  },
  button: {
    backgroundColor: "#21C15A",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Registration;
