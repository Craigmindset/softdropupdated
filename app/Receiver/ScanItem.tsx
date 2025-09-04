import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  StatusBar,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";

const GREEN = "#21C15A";
const BG = "#0D0F14";

export default function ScanItem() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null); // Fix: specify CameraView type
  const [stage, setStage] = useState<"camera" | "preview">("camera");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  const ensureCamPerms = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) return false;
    }
    return true;
  };

  const takeShot = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: true,
      });
      setPhotoUri(photo.uri);
      setStage("preview");
    } catch (e) {
      console.warn("Failed to capture:", e);
    }
  };

  const retake = () => {
    setPhotoUri(null);
    setStage("camera");
  };

  const acceptPhoto = () => {
    if (!photoUri) return;
    setModalVisible(true);
  };

  const handleSubmit = () => {
    if (!checkboxChecked) return;
    setModalVisible(false);
    router.replace({
      pathname: "/Receiver/Success",
      params: { uri: photoUri },
    });
  };

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: BG }} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: BG,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 18, marginBottom: 16 }}>
          Camera permission needed
        </Text>
        <Pressable onPress={requestPermission} style={styles.cta}>
          <Text style={styles.ctaText}>Grant Permission</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.navBtn}
        >
          <MaterialIcons name="arrow-back-ios-new" size={18} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Snap Item</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.container}>
        {stage === "camera" && (
          <View style={styles.cameraWrap}>
            <CameraView ref={cameraRef} style={{ flex: 1 }} ratio="16:9" />
            <Pressable onPress={takeShot} style={styles.captureBtn}>
              <Text style={styles.captureText}>Capture</Text>
            </Pressable>
          </View>
        )}
        {stage === "preview" && photoUri && (
          <View style={{ flex: 1 }}>
            <View style={styles.previewBox}>
              <Image
                source={{ uri: photoUri }}
                style={styles.previewImg}
                resizeMode="cover"
              />
            </View>
            <View style={[styles.row, { marginTop: 40, marginBottom: 40 }]}>
              <Pressable
                style={[styles.actionBtn, styles.outline]}
                onPress={retake}
              >
                <Text style={[styles.actionBtnText, { color: GREEN }]}>
                  Retake
                </Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.fill]}
                onPress={acceptPhoto}
              >
                <Text style={[styles.actionBtnText, { color: "#fff" }]}>
                  Use Photo
                </Text>
              </Pressable>
            </View>
            <Modal
              visible={modalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Confirm Receipt</Text>
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setCheckboxChecked((v) => !v)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        checkboxChecked && styles.checkboxChecked,
                      ]}
                    >
                      {checkboxChecked && (
                        <MaterialIcons name="check" size={18} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      I have received the item
                    </Text>
                  </TouchableOpacity>
                  <Pressable
                    style={[
                      styles.submitBtn,
                      !checkboxChecked && { opacity: 0.5 },
                    ]}
                    onPress={handleSubmit}
                    disabled={!checkboxChecked}
                  >
                    <Text style={styles.submitBtnText}>Submit</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  cameraWrap: {
    flex: 1,
    marginTop: 2,
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  captureBtn: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 60,
    backgroundColor: GREEN,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  captureText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  previewBox: {
    marginTop: 12,
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  previewImg: { width: "100%", height: "100%" },
  row: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  outline: {
    borderWidth: 2,
    borderColor: GREEN,
    backgroundColor: "transparent",
  },
  fill: { backgroundColor: GREEN },
  actionBtnText: { fontSize: 15, fontWeight: "800" },
  cta: {
    marginTop: 18,
    height: 54,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
    paddingHorizontal: 32,
  },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 18,
    color: "#222",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
  },
  submitBtn: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
