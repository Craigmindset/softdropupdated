import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

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
      <View style={styles.inputWrap}>
        <MaterialIcons
          name="phone"
          size={24}
          color="#21C15A"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={(val) => setPhone(val.replace(/\D/g, "").slice(0, 11))}
          placeholder="08xxxxxxxxx"
          keyboardType="number-pad"
          maxLength={11}
          placeholderTextColor="#888"
        />
      </View>
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
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#21C15A",
    borderRadius: 10,
    backgroundColor: "#F7F7F7",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 18,
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
