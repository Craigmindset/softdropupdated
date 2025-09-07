// SendParcel.tsx
import React, { useMemo, useState } from "react";
import * as Location from "expo-location";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar as RNStatusBar,
  Modal,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const COLOR = {
  bg: "#0C1515",
  text: "#E8F1EE",
  sub: "#A8B7B2",
  card: "#0F2020",
  line: "rgba(232, 241, 238, 0.10)",
  green: "#2F7E5D",
  greenSoft: "#1D5E46",
  inputBg: "#0E1A1A",
  inputBorder: "rgba(232, 241, 238, 0.20)",
  btn: "#1ABC86",
  sheet: "#0E1A1A",
};

type RouteKey = "intra" | "inter" | "intl";
type ItemOpt = { key: string; label: string; icon: string };

const ITEM_OPTIONS: ItemOpt[] = [
  { key: "documents", label: "Documents", icon: "file-document-outline" },
  { key: "fragile", label: "Fragile", icon: "glass-fragile" },
  { key: "clothes", label: "Clothes", icon: "tshirt-crew-outline" },
  { key: "gadget", label: "Gadget", icon: "cellphone" },
];

const INTL_IMG = require("../../assets/images/international.png");

const SendParcel: React.FC = () => {
  const router = useRouter();

  const [route, setRoute] = useState<RouteKey>("intra");
  const [itemType, setItemType] = useState<string>("");
  const [showTypeSheet, setShowTypeSheet] = useState(false);

  const [qty, setQty] = useState<number>(0);
  const [images, setImages] = useState<string[]>([]);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");

  const [validateReceiver, setValidateReceiver] = useState(false);
  const [deliveryType, setDeliveryType] = useState("");
  const [showDeliverySheet, setShowDeliverySheet] = useState(false);

  // NEW: plain text locations (no Google APIs)
  const [senderLocation, setSenderLocation] = useState("");
  const [receiverLocation, setReceiverLocation] = useState("");

  // Enable Next only when both locations are provided
  const ready =
    senderLocation.trim().length > 0 && receiverLocation.trim().length > 0;

  const routes = useMemo(
    () => [
      {
        key: "intra" as RouteKey,
        label: "Intra-City",
        icon: "map-marker-radius",
      },
      {
        key: "inter" as RouteKey,
        label: "Inter-State",
        icon: "map-marker-path",
      },
      { key: "intl" as RouteKey, label: "International", icon: "earth" },
    ],
    []
  );

  const addMockImage = async () => {
    if (images.length >= 2) return;
    // Request permission
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Please allow access to your gallery to upload images."
      );
      return;
    }
    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages((p) => [...p, result.assets[0].uri]);
    }
  };
  // Removed placeholder image logic. Only actual selected images are added.

  const pickType = (opt: ItemOpt) => {
    setItemType(opt.label);
    setShowTypeSheet(false);
  };

  const goNext = () => {
    if (!ready) return;
    // TODO: store senderLocation & receiverLocation or pass via route params
    router.push("/DeliveryFlow/DeliveryMap");
  };

  const handlePickImage = async (index: number) => {
    // Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your storage to upload images from your Gallery."
      );
      return;
    }

    // Open gallery for image selection
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const fileType =
        asset.type ||
        (uri.split(".").pop() as string | undefined)?.toLowerCase();
      const allowed = ["jpeg", "jpg", "png"];
      const okType =
        (fileType ? allowed.includes(fileType) : false) ||
        (asset.mimeType && allowed.some((t) => asset.mimeType?.includes(t)));
      const okSize = !asset.fileSize || asset.fileSize <= 5 * 1024 * 1024;

      if (!okType || !okSize) {
        Alert.alert("Invalid Image", "Accepted: JPEG/JPG/PNG. Max size: 5 MB.");
        return;
      }

      const next = [...images];
      next[index] = uri;
      setImages(next);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.safe}>
        <RNStatusBar
          backgroundColor={COLOR.bg}
          barStyle="light-content"
          translucent={false}
        />
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.8}
            >
              <MCI name="arrow-left" size={22} color={COLOR.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { marginTop: 32 }]}>
              Find your choosen route
            </Text>
          </View>

          {/* Route Tabs */}
          <View style={styles.routeRow}>
            {routes.map((r) => {
              const active = route === r.key;
              return (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.routeCard, active && styles.routeCardActive]}
                  onPress={() => setRoute(r.key)}
                  activeOpacity={0.9}
                >
                  <MCI
                    name={r.icon as any}
                    size={28}
                    color={active ? COLOR.text : COLOR.green}
                  />
                  <Text
                    style={[
                      styles.routeLabel,
                      active && styles.routeLabelActive,
                    ]}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ===== If International, show "Coming Soon" and stop here ===== */}
          {route === "intl" ? (
            <View style={styles.soonWrap}>
              <Image
                source={INTL_IMG}
                style={styles.soonImg}
                resizeMode="contain"
              />
              <Text style={styles.soonTitle}>Coming Soon</Text>
            </View>
          ) : (
            <>
              {/* Item Type Selector */}
              <Text style={styles.label}>
                What type of item do you want to send?
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.selectRow}
                onPress={() => setShowTypeSheet(true)}
              >
                <Text
                  style={[
                    styles.inputText,
                    { color: itemType ? COLOR.text : COLOR.sub },
                  ]}
                >
                  {itemType || "Select item type"}
                </Text>
                <MCI name="chevron-right" size={22} color={COLOR.sub} />
              </TouchableOpacity>

              {/* Quantity */}
              <Text style={[styles.label, { marginTop: 18 }]}>Quantity</Text>
              <View style={styles.qtyRow}>
                <View style={styles.qtyBox}>
                  <Text style={styles.qtyValue}>{qty}</Text>
                </View>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    onPress={() => setQty((v) => Math.max(0, v - 1))}
                    style={styles.stepBtn}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.stepText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setQty((v) => Math.min(99, v + 1))}
                    style={[
                      styles.stepBtn,
                      { borderLeftWidth: 1, borderLeftColor: COLOR.line },
                    ]}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.stepText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Upload Images */}
              <View style={styles.uploadHeaderRow}>
                <Text style={styles.label}>Upload Image of Item</Text>
                <TouchableOpacity
                  onPress={addMockImage}
                  style={styles.addBtn}
                  activeOpacity={0.85}
                >
                  <MCI name="plus" size={18} color={COLOR.text} />
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>
                Supported formats are .jpg and .png{"\n"}Pictures may not exceed
                5MB
              </Text>

              <View style={styles.thumbRow}>
                {[0, 1].map((i) => {
                  const has = images[i];
                  return (
                    <View
                      key={i}
                      style={[styles.thumb, has && { borderStyle: "solid" }]}
                    >
                      {has ? (
                        <>
                          <Image
                            source={{ uri: has }}
                            style={styles.thumbImage}
                          />
                          <TouchableOpacity
                            style={styles.deleteIcon}
                            onPress={() => {
                              setImages((imgs) =>
                                imgs.filter((_, idx) => idx !== i)
                              );
                            }}
                          >
                            <MCI name="close" size={18} color={COLOR.text} />
                          </TouchableOpacity>
                        </>
                      ) : null}
                    </View>
                  );
                })}
              </View>

              <View style={styles.divider} />

              {/* Select Delivery (only Inter-State) */}
              {route === "inter" && (
                <View style={{ marginTop: 16 }}>
                  <Text
                    style={{
                      color: COLOR.text,
                      fontSize: 16,
                      fontWeight: "bold",
                      marginBottom: 12,
                    }}
                  >
                    Select Delivery
                  </Text>
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: COLOR.inputBg,
                      borderRadius: 8,
                      padding: 12,
                    }}
                    onPress={() => setShowDeliverySheet(true)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        color: deliveryType ? COLOR.text : COLOR.sub,
                        flex: 1,
                      }}
                    >
                      {deliveryType || "Select Delivery Type"}
                    </Text>
                    <MCI name="chevron-right" size={22} color={COLOR.sub} />
                  </TouchableOpacity>

                  <Modal
                    visible={showDeliverySheet}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowDeliverySheet(false)}
                  >
                    <View style={styles.sheetBackdrop}>
                      <View style={styles.sheet}>
                        <TouchableOpacity
                          onPress={() => setShowDeliverySheet(false)}
                          style={styles.sheetClose}
                          activeOpacity={0.8}
                          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                        >
                          <MCI name="close" size={20} color={COLOR.sub} />
                        </TouchableOpacity>

                        <View style={styles.sheetHandle} />
                        <Text
                          style={[styles.sheetTitle, { textAlign: "center" }]}
                        >
                          Select Delivery Type
                        </Text>

                        <View style={styles.optionGrid}>
                          {["Upon Arrival", "Home Delivery"].map((opt) => {
                            const active = deliveryType === opt;
                            return (
                              <TouchableOpacity
                                key={opt}
                                activeOpacity={0.9}
                                style={[
                                  styles.optCard,
                                  active && styles.optCardActive,
                                ]}
                                onPress={() => {
                                  setDeliveryType(opt);
                                  setShowDeliverySheet(false);
                                }}
                              >
                                <Text
                                  style={[
                                    styles.optLabel,
                                    active && styles.optLabelActive,
                                  ]}
                                >
                                  {opt}
                                </Text>
                                {active ? (
                                  <MCI
                                    name="check-circle"
                                    size={18}
                                    color={COLOR.btn}
                                    style={{
                                      position: "absolute",
                                      top: 8,
                                      right: 8,
                                    }}
                                  />
                                ) : null}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                  </Modal>
                </View>
              )}

              {/* Receiver Name */}
              <Text style={styles.label}>Enter receiver’s name</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  placeholder="e.g. John Doe"
                  placeholderTextColor={COLOR.sub}
                  value={receiverName}
                  onChangeText={setReceiverName}
                  style={styles.input}
                />
              </View>

              {/* Receiver Contact */}
              <Text style={styles.label}>Enter receiver’s contact</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  placeholder="Phone number"
                  placeholderTextColor={COLOR.sub}
                  keyboardType="phone-pad"
                  value={receiverPhone}
                  onChangeText={setReceiverPhone}
                  style={[styles.input, { paddingRight: 40 }]}
                />
                <MCI
                  name="phone-outline"
                  size={18}
                  color={COLOR.sub}
                  style={styles.inputIcon}
                />
              </View>

              {/* Validate Receiver */}
              <View style={styles.validateRow}>
                <MCI name="shield-check-outline" size={18} color={COLOR.text} />
                <Text style={styles.validateText}>Validate the receiver</Text>
                <TouchableOpacity
                  onPress={() => setValidateReceiver((v) => !v)}
                  style={styles.checkbox}
                  activeOpacity={0.8}
                >
                  {validateReceiver ? (
                    <MCI name="check-bold" size={14} color={COLOR.text} />
                  ) : null}
                </TouchableOpacity>
                <Text style={styles.star}>*</Text>
              </View>
              <View style={styles.divider} />

              {/* ── NEW: Sender & Receiver Location (plain inputs) ── */}
              <Text style={styles.label}>Sender location</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  placeholder="Enter sender location"
                  placeholderTextColor={COLOR.sub}
                  value={senderLocation}
                  onChangeText={setSenderLocation}
                  style={[styles.input, { paddingRight: 40 }]}
                />
                <TouchableOpacity
                  style={styles.inputIcon}
                  onPress={async () => {
                    try {
                      let { status } =
                        await Location.requestForegroundPermissionsAsync();
                      if (status !== "granted") {
                        Alert.alert(
                          "Permission denied",
                          "Location permission is required to autofill your address."
                        );
                        return;
                      }
                      let loc = await Location.getCurrentPositionAsync({});
                      let geocode = await Location.reverseGeocodeAsync(
                        loc.coords
                      );
                      if (geocode && geocode.length > 0) {
                        const { name, street, city, region, country } =
                          geocode[0];
                        const address = [name, street, city, region, country]
                          .filter(Boolean)
                          .join(", ");
                        setSenderLocation(address);
                      } else {
                        setSenderLocation(
                          `${loc.coords.latitude}, ${loc.coords.longitude}`
                        );
                      }
                    } catch (err) {
                      Alert.alert("Error", "Unable to get current location.");
                    }
                  }}
                >
                  <MCI name="map-marker-outline" size={18} color={COLOR.sub} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { marginTop: 6 }]}>
                Receiver location
              </Text>
              <View style={styles.inputWrap}>
                <TextInput
                  placeholder="Enter receiver location"
                  placeholderTextColor={COLOR.sub}
                  value={receiverLocation}
                  onChangeText={setReceiverLocation}
                  style={[styles.input, { paddingRight: 40 }]}
                />
                <MCI
                  name="map-marker-outline"
                  size={18}
                  color={COLOR.sub}
                  style={styles.inputIcon}
                />
              </View>

              {/* Next Button */}
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.nextBtn, !ready && { opacity: 0.5 }]}
                disabled={!ready}
                onPress={goNext}
              >
                <Text style={styles.nextText}>Next</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* ---- Bottom Sheet: Item Type ---- */}
      <Modal
        visible={showTypeSheet && route !== "intl"}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTypeSheet(false)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <TouchableOpacity
              onPress={() => setShowTypeSheet(false)}
              style={styles.sheetClose}
              activeOpacity={0.8}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <MCI name="close" size={20} color={COLOR.sub} />
            </TouchableOpacity>

            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select item type</Text>

            <View style={styles.optionGrid}>
              {ITEM_OPTIONS.map((opt) => {
                const active = itemType === opt.label;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    activeOpacity={0.9}
                    style={[styles.optCard, active && styles.optCardActive]}
                    onPress={() => {
                      pickType(opt);
                    }}
                  >
                    <View
                      style={[
                        styles.optIconWrap,
                        active && styles.optIconActive,
                      ]}
                    >
                      <MCI
                        name={opt.icon as any}
                        size={22}
                        color={active ? COLOR.text : COLOR.green}
                      />
                    </View>
                    <Text
                      style={[styles.optLabel, active && styles.optLabelActive]}
                    >
                      {opt.label}
                    </Text>
                    {active ? (
                      <MCI
                        name="check-circle"
                        size={18}
                        color={COLOR.btn}
                        style={{ position: "absolute", top: 8, right: 8 }}
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SendParcel;

const styles = StyleSheet.create({
  thumbImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },
  deleteIcon: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 12,
    padding: 2,
    zIndex: 2,
  },
  safe: { flex: 1, backgroundColor: COLOR.bg },
  container: { flex: 1, paddingHorizontal: 18 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 30,
    marginBottom: 18,
  },
  backBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR.card,
  },
  title: { color: COLOR.text, fontSize: 20, fontWeight: "700" },

  routeRow: { flexDirection: "row", gap: 12, marginBottom: 18 },
  routeCard: {
    flex: 1,
    backgroundColor: COLOR.card,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLOR.line,
  },
  routeCardActive: {
    backgroundColor: COLOR.greenSoft,
    borderColor: COLOR.green,
  },
  routeLabel: { color: COLOR.sub, fontSize: 12, fontWeight: "600" },
  routeLabelActive: { color: COLOR.text },

  label: {
    color: COLOR.text,
    marginBottom: 8,
    marginTop: 6,
    fontWeight: "600",
  },
  selectRow: {
    backgroundColor: COLOR.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputText: { fontSize: 14 },

  qtyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyBox: {
    flex: 1,
    backgroundColor: COLOR.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.inputBorder,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  qtyValue: { color: COLOR.text, fontWeight: "700", fontSize: 16 },
  stepper: {
    flexDirection: "row",
    backgroundColor: COLOR.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.inputBorder,
    overflow: "hidden",
  },
  stepBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  stepText: { color: COLOR.text, fontSize: 16, fontWeight: "800" },

  uploadHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
  },
  addBtn: {
    backgroundColor: COLOR.greenSoft,
    height: 36,
    width: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLOR.green,
  },
  hint: { color: COLOR.sub, fontSize: 12, marginTop: 6 },
  thumbRow: { flexDirection: "row", gap: 12, marginTop: 10 },
  thumb: {
    flex: 1,
    height: 64,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLOR.inputBorder,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR.inputBg,
  },
  divider: {
    height: 0.5,
    backgroundColor: "#A8FFB0", // updated from "yellow" to lite green
    marginVertical: 14,
    marginTop: 18,
  },

  inputWrap: {
    backgroundColor: COLOR.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.inputBorder,
    marginBottom: 12,
  },
  input: {
    color: COLOR.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
  },
  inputIcon: { position: "absolute", right: 12, top: 14 },

  validateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 6,
  },
  validateText: { color: COLOR.text, flex: 1 },
  checkbox: {
    height: 20,
    width: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLOR.inputBorder,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  star: { color: COLOR.text, marginLeft: 4 },

  nextBtn: {
    backgroundColor: COLOR.btn,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
  },
  nextText: { color: "#03312A", fontWeight: "800", fontSize: 16 },

  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLOR.sheet,
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: COLOR.inputBorder,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLOR.inputBorder,
    marginBottom: 10,
  },
  sheetTitle: {
    color: COLOR.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  sheetClose: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },

  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  optCard: {
    width: "47%",
    backgroundColor: COLOR.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.inputBorder,
    paddingVertical: 16,
    alignItems: "center",
    gap: 10,
  },
  optCardActive: { borderColor: COLOR.btn, backgroundColor: COLOR.greenSoft },
  optIconWrap: {
    height: 44,
    width: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#132121",
    borderWidth: 1,
    borderColor: COLOR.inputBorder,
  },
  optIconActive: { backgroundColor: "#174236", borderColor: COLOR.btn },
  optLabel: { color: COLOR.sub, fontWeight: "600" },
  optLabelActive: { color: COLOR.text },

  soonWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    paddingVertical: 40,
  },
  soonImg: { width: "90%", height: 220, marginBottom: 12 },
  soonTitle: { color: COLOR.text, fontSize: 20, fontWeight: "800" },
});
