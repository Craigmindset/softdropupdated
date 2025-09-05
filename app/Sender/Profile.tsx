import React, { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/** -----------------------------
 *  Config / Design Tokens
 *  ----------------------------*/
const COLORS = {
  bg: "#0B0E11",
  card: "#11151A",
  surface: "#0E1318",
  text: "#E8ECEF",
  textMuted: "#A9B0B6",
  border: "#26303A",
  primary: "#21C15A",
  danger: "#EF4444",
  inputBg: "#0E141A",
  placeholder: "#78818A",
};

const RADIUS = 12;

const STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

/** -----------------------------
 *  Helpers
 *  ----------------------------*/
const emailOk = (val: string) => /^\S+@\S+\.\S+$/.test(val.trim());

const nameOk = (val: string) => /^[A-Za-z][A-Za-z \-']{1,}$/.test(val.trim());

/** -----------------------------
 *  Reusable Input Row
 *  ----------------------------*/
type FieldProps = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: string;
  onChangeText?: (t: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  editable?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string | null;
  testID?: string;
};

function LabeledInput({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  editable = true,
  autoCapitalize = "words",
  error = null,
  testID,
}: FieldProps) {
  const hasError = Boolean(error);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          { borderColor: hasError ? COLORS.danger : COLORS.border },
          !editable && { opacity: 0.7 },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          style={{ marginRight: 10 }}
          color={hasError ? COLORS.danger : COLORS.textMuted}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          value={value}
          editable={editable}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          selectionColor={COLORS.primary}
          accessibilityLabel={label}
          testID={testID}
        />
        {!hasError && value?.length > 0 && (
          <MaterialCommunityIcons
            name="check-circle"
            size={18}
            color={COLORS.primary}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        )}
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

/** -----------------------------
 *  Screen
 *  ----------------------------*/
export default function Profile() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const registeredPhone = typeof params.phone === "string" ? params.phone : "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("Lagos");
  const [submitting, setSubmitting] = useState(false);

  // Inline validation messages
  const firstNameError = useMemo(
    () =>
      firstName.length === 0
        ? null
        : nameOk(firstName)
        ? null
        : "Enter a valid first name",
    [firstName]
  );
  const lastNameError = useMemo(
    () =>
      lastName.length === 0
        ? null
        : nameOk(lastName)
        ? null
        : "Enter a valid last name",
    [lastName]
  );
  const emailError = useMemo(
    () =>
      email.length === 0
        ? null
        : emailOk(email)
        ? null
        : "Enter a valid email address",
    [email]
  );

  const onSubmit = () => {
    // Final validation
    const errors: string[] = [];
    if (!nameOk(firstName)) errors.push("First name is invalid.");
    if (!nameOk(lastName)) errors.push("Last name is invalid.");
    if (!emailOk(email)) errors.push("Email is invalid.");
    if (!state) errors.push("Please select a state.");

    if (errors.length) {
      Alert.alert("Fix the following", errors.join("\n"));
      return;
    }

    setSubmitting(true);
    // Simulate submit
    setTimeout(() => {
      setSubmitting(false);
      // Route to Sender/CreatePassword after saving
      router.push("/Sender/CreatePassword");
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons
                name="account-circle"
                size={28}
                color={COLORS.text}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.title}>Sender Profile</Text>
            </View>
            <Text style={styles.subtitle}>
              Complete your details to continue
            </Text>
          </View>

          {/* Names row */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <LabeledInput
                label="First Name"
                icon="account-outline"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="e.g. Chinedu"
                autoCapitalize="words"
                error={firstNameError}
                testID="first-name"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <LabeledInput
                label="Last Name"
                icon="account"
                value={lastName}
                onChangeText={setLastName}
                placeholder="e.g. Okoro"
                autoCapitalize="words"
                error={lastNameError}
                testID="last-name"
              />
            </View>
          </View>

          {/* Email */}
          <LabeledInput
            label="Email"
            icon="email-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="e.g. you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
            testID="email"
          />

          {/* Phone (read-only from params) */}
          <LabeledInput
            label="Phone Number"
            icon="phone-lock-outline"
            value={registeredPhone}
            placeholder="Phone on record"
            keyboardType="phone-pad"
            editable={false}
            autoCapitalize="none"
            testID="phone"
          />

          {/* State Picker */}
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>State</Text>
            <View style={styles.pickerWrap}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={20}
                color={COLORS.textMuted}
                style={{ marginLeft: 12, marginRight: 6 }}
              />
              <Picker
                selectedValue={state}
                onValueChange={(v) => setState(String(v))}
                style={styles.picker}
                dropdownIconColor={COLORS.text}
                itemStyle={{ color: COLORS.text }}
              >
                {STATES.map((s) => (
                  <Picker.Item
                    key={s}
                    label={s}
                    value={s}
                    color={COLORS.text}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={onSubmit}
            activeOpacity={0.9}
            disabled={submitting}
            style={[styles.button, submitting && { opacity: 0.8 }]}
          >
            {submitting ? (
              <View style={styles.btnInner}>
                <MaterialCommunityIcons
                  name="loading"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.buttonText}>Saving…</Text>
              </View>
            ) : (
              <View style={styles.btnInner}>
                <MaterialCommunityIcons
                  name="content-save-outline"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.buttonText}>Submit</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** -----------------------------
 *  Styles
 *  ----------------------------*/
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 6,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    paddingHorizontal: 12,
    height: 52,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
  },
  pickerWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    overflow: "hidden",
    height: 52,
    justifyContent: "space-between",
  },
  picker: {
    flex: 1,
    color: COLORS.text,
    ...Platform.select({
      android: { height: 52, marginLeft: -6 }, // tighter alignment
    }),
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginTop: 8,
  },
  btnInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  errorText: {
    marginTop: 6,
    color: COLORS.danger,
    fontSize: 12.5,
  },
});
