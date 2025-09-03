// app/Carrier/IDSelection.tsx
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const GREEN = "#21C15A";
const TEXT = "#222222";
const MUTED = "#7A7F87";
const BORDER = "#DDE2E8";
const CARD = "#F7F9FC";

type DocType = "passport" | "drivers" | "nin";

const COUNTRIES = ["Nigeria", "Ghana"];

export default function IDSelection() {
  const router = useRouter();

  // State
  const [country, setCountry] = useState("Nigeria");
  const [countryOpen, setCountryOpen] = useState(false);
  const [docType, setDocType] = useState<DocType>("passport");

  const docItems = useMemo(
    () => [
      { key: "passport" as DocType, label: "National Passport" },
      { key: "drivers" as DocType, label: "Driver’s License" },
      { key: "nin" as DocType, label: "Voter's Card" },
    ],
    []
  );

  const onOpenCamera = () => {
    // Navigate to the ScanningId screen
    router.push("/Carrier/ScanningId");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.container, { marginTop: 30 }]}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={styles.backBtn}
          >
            <MaterialIcons
              name="arrow-back-ios-new"
              size={20}
              color={TEXT}
              style={styles.backIcon}
            />
          </Pressable>
          <Text style={styles.title}>Upload a valid ID</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Country of Issuance */}
        <Text style={[styles.label, { marginTop: 30 }]}>
          Country of Issuance
        </Text>
        <Pressable
          onPress={() => setCountryOpen(true)}
          style={styles.selectInput}
        >
          <Text style={styles.selectValue}>{country}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={TEXT} />
        </Pressable>

        {/* Document Type */}
        <Text style={[styles.label, { marginTop: 30 }]}>Document Type</Text>

        <View style={{ gap: 10 }}>
          {docItems.map((item) => {
            const selected = docType === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setDocType(item.key)}
                style={[styles.radioRow, selected && styles.radioRowSelected]}
              >
                <View style={[styles.radioDotWrap, selected && styles.dotOn]}>
                  {selected ? <View style={styles.dotCore} /> : null}
                </View>
                <Text style={styles.radioLabel}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Open Camera */}
        <Pressable onPress={onOpenCamera} style={styles.cta}>
          <Text style={styles.ctaText}>Open Camera</Text>
        </Pressable>
      </View>

      {/* Country Picker Modal (simple + dependency-free) */}
      <Modal visible={countryOpen} transparent animationType="fade">
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCountryOpen(false)}
        >
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(c) => c}
              renderItem={({ item }) => {
                const selected = item === country;
                return (
                  <Pressable
                    onPress={() => {
                      setCountry(item);
                      setCountryOpen(false);
                    }}
                    style={styles.countryRow}
                  >
                    <Text
                      style={[styles.countryText, selected && { color: GREEN }]}
                    >
                      {item}
                    </Text>
                    {selected ? (
                      <MaterialIcons name="check" size={18} color={GREEN} />
                    ) : null}
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 6 },
  topBar: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { backgroundColor: "#F1F3F6", borderRadius: 18, padding: 6 },
  title: { fontSize: 18, fontWeight: "700", color: TEXT },

  label: {
    marginTop: 14,
    marginBottom: 6,
    color: TEXT,
    fontSize: 13,
    fontWeight: "600",
  },

  selectInput: {
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectValue: { color: TEXT, fontSize: 15 },

  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFF",
  },
  radioRowSelected: {
    borderColor: GREEN,
    backgroundColor: CARD,
  },
  radioLabel: { marginLeft: 10, color: TEXT, fontSize: 15, fontWeight: "600" },

  radioDotWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#C6CBD3",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  dotOn: {
    borderColor: GREEN,
  },
  dotCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
  },

  cta: {
    marginTop: 30,
    backgroundColor: GREEN,
    height: 54,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  ctaText: { color: "#FFF", fontSize: 16, fontWeight: "800" },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    padding: 24,
    justifyContent: "center",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    padding: 8,
    paddingBottom: 12,
  },
  countryRow: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countryText: { fontSize: 15, color: TEXT },
  separator: { height: 1, backgroundColor: "#F0F2F5" },
});
