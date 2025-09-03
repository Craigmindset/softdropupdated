// app/Carrier/ScanningId.tsx
import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";

const GREEN = "#21C15A";
const TEXT = "#222222";
const MUTED = "#7A7F87";
const BORDER = "#E4E7EB";
const OVERLAY_DIM = "rgba(0,0,0,0.45)";

type Stage =
  | "choice" // choose front/back + capture or upload
  | "cameraFront"
  | "previewFront"
  | "cameraBack"
  | "previewBack"
  | "review"
  | "submitting";

export default function ScanningId() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);
  const [stage, setStage] = useState<Stage>("choice");
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [loading, setLoading] = useState(false);

  const ensureCamPerms = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) return false;
    }
    return true;
  };

  const openCameraFor = async (side: "front" | "back") => {
    const ok = await ensureCamPerms();
    if (!ok) return;
    setActiveSide(side);
    setStage(side === "front" ? "cameraFront" : "cameraBack");
  };

  const takeShot = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: true,
      });
      if (activeSide === "front") {
        setFrontUri(photo.uri);
        setStage("previewFront");
      } else {
        setBackUri(photo.uri);
        setStage("previewBack");
      }
    } catch (e) {
      console.warn("Failed to capture:", e);
    }
  };

  const pickFromGalleryFor = async (side: "front" | "back") => {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!res.granted) return;
    const img = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (img.canceled) return;
    const uri = img.assets?.[0]?.uri;
    if (!uri) return;
    if (side === "front") {
      setFrontUri(uri);
      setStage("previewFront");
    } else {
      setBackUri(uri);
      setStage("previewBack");
    }
  };

  const retake = (side: "front" | "back") => {
    openCameraFor(side);
  };

  const acceptPreview = () => {
    if (stage === "previewFront") {
      // go collect the back if not set yet
      if (!backUri) {
        setActiveSide("back");
        setStage("choice");
      } else {
        setStage("review");
      }
    } else if (stage === "previewBack") {
      if (!frontUri) {
        setActiveSide("front");
        setStage("choice");
      } else {
        setStage("review");
      }
    }
  };

  const canSubmit = Boolean(frontUri && backUri);

  const onSubmit = () => {
    if (!canSubmit) return;
    setStage("submitting");
    setLoading(true);

    // Simulate upload/processing 15s
    setTimeout(() => {
      setLoading(false);
      // Route to FacialSelfie: since permission was granted here,
      // FacialSelfie will detect permission.granted === true and skip the prompt.
      router.replace("/Carrier/FacialSelfie");
    }, 15000);
  };

  // ——————————————————— Renders ———————————————————

  if (!permission) {
    // while loading permission hook
    return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
  }

  const ChoiceBlock = () => (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.subtitle}>Capture each side of your ID</Text>

      {/* FRONT */}
      <View style={styles.card}>
        <View style={styles.sideHeader}>
          <Text style={styles.sideTitle}>Front</Text>
          {frontUri ? (
            <MaterialIcons name="check-circle" size={18} color={GREEN} />
          ) : null}
        </View>
        <View style={styles.row}>
          <Pressable
            style={styles.actionSmall}
            onPress={() => openCameraFor("front")}
          >
            <MaterialIcons name="photo-camera" size={18} color="#fff" />
            <Text style={styles.actionSmallText}>Take Photo</Text>
          </Pressable>
          <Pressable
            style={[styles.actionSmall, styles.actionOutline]}
            onPress={() => pickFromGalleryFor("front")}
          >
            <MaterialIcons name="file-upload" size={18} color={GREEN} />
            <Text style={[styles.actionSmallText, { color: GREEN }]}>
              Upload
            </Text>
          </Pressable>
        </View>
        {frontUri ? (
          <Image
            source={{ uri: frontUri }}
            style={styles.thumb}
            resizeMode="cover"
          />
        ) : null}
      </View>

      {/* BACK */}
      <View style={styles.card}>
        <View style={styles.sideHeader}>
          <Text style={styles.sideTitle}>Back</Text>
          {backUri ? (
            <MaterialIcons name="check-circle" size={18} color={GREEN} />
          ) : null}
        </View>
        <View style={styles.row}>
          <Pressable
            style={styles.actionSmall}
            onPress={() => openCameraFor("back")}
          >
            <MaterialIcons name="photo-camera" size={18} color="#fff" />
            <Text style={styles.actionSmallText}>Take Photo</Text>
          </Pressable>
          <Pressable
            style={[styles.actionSmall, styles.actionOutline]}
            onPress={() => pickFromGalleryFor("back")}
          >
            <MaterialIcons name="file-upload" size={18} color={GREEN} />
            <Text style={[styles.actionSmallText, { color: GREEN }]}>
              Upload
            </Text>
          </Pressable>
        </View>
        {backUri ? (
          <Image
            source={{ uri: backUri }}
            style={styles.thumb}
            resizeMode="cover"
          />
        ) : null}
      </View>

      <Pressable
        disabled={!canSubmit}
        onPress={onSubmit}
        style={[styles.cta, !canSubmit && { opacity: 0.5 }]}
      >
        <Text style={styles.ctaText}>Submit</Text>
      </Pressable>
    </View>
  );

  const CameraWithGuide = ({ side }: { side: "front" | "back" }) => (
    <View style={styles.cameraWrap}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} ratio="16:9" />
      {/* Dim overlay */}
      <View pointerEvents="none" style={styles.overlayRoot}>
        <View style={styles.dim} />
        {/* ID guide: a centered rounded-rect with corner brackets */}
        <View style={styles.guideBox}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
        <Text style={styles.overlayText}>
          {side === "front"
            ? "Align the FRONT of your ID"
            : "Align the BACK of your ID"}
        </Text>
      </View>

      <Pressable onPress={takeShot} style={styles.captureBtn}>
        <Text style={styles.captureText}>Capture</Text>
      </Pressable>
    </View>
  );

  const PreviewSide = ({
    side,
    uri,
  }: {
    side: "front" | "back";
    uri: string;
  }) => (
    <View style={{ flex: 1 }}>
      <View style={styles.previewBox}>
        <Image source={{ uri }} style={styles.previewImg} resizeMode="cover" />
      </View>
      <View style={styles.row}>
        <Pressable
          style={[styles.actionBtn, styles.outline]}
          onPress={() => retake(side)}
        >
          <Text style={[styles.actionBtnText, { color: GREEN }]}>Retake</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.fill]}
          onPress={acceptPreview}
        >
          <Text style={[styles.actionBtnText, { color: "#fff" }]}>
            Use Photo
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0F14" />
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.navBtn}
        >
          <MaterialIcons name="arrow-back-ios-new" size={18} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Scan your ID</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Body */}
      <View style={[styles.container, { marginTop: 40 }]}>
        {stage === "choice" || stage === "review" ? (
          <>
            <Text style={styles.title}>Uploading…</Text>
            <ChoiceBlock />
          </>
        ) : null}

        {stage === "cameraFront" ? <CameraWithGuide side="front" /> : null}
        {stage === "previewFront" && frontUri ? (
          <PreviewSide side="front" uri={frontUri} />
        ) : null}

        {stage === "cameraBack" ? <CameraWithGuide side="back" /> : null}
        {stage === "previewBack" && backUri ? (
          <PreviewSide side="back" uri={backUri} />
        ) : null}
      </View>

      {/* Submitting overlay (15s) */}
      <Modal visible={stage === "submitting"} transparent animationType="fade">
        <View style={styles.submitOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.submitText}>Uploading…</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0F14" },
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
    backgroundColor: "#0D0F14",
    paddingHorizontal: 16,
    paddingBottom: 18,
  },

  title: {
    color: "#E9EDF2",
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "700",
    fontSize: 16,
  },
  subtitle: { color: "#C9D1DB", fontSize: 13, marginBottom: 10 },

  // Choice cards
  card: {
    backgroundColor: "#10141B",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  sideHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sideTitle: { color: "#E9EDF2", fontSize: 15, fontWeight: "700" },

  row: { flexDirection: "row", gap: 10 },
  actionSmall: {
    flex: 1,
    backgroundColor: GREEN,
    borderRadius: 10,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  actionSmallText: { color: "#fff", fontWeight: "700" },
  actionOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: GREEN,
  },

  thumb: {
    marginTop: 10,
    height: 140,
    borderRadius: 10,
    backgroundColor: "#000",
  },

  cta: {
    marginTop: 18,
    height: 54,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
  },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  // Camera
  cameraWrap: {
    flex: 1,
    marginTop: 12,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: OVERLAY_DIM },

  guideBox: {
    width: 260,
    height: 170,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)", // faint frame
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 26,
    height: 26,
    borderColor: "#FFFFFF",
  },
  tl: {
    top: -1,
    left: -1,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 10,
  },
  tr: {
    top: -1,
    right: -1,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 10,
  },
  bl: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 10,
  },
  br: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 10,
  },

  overlayText: {
    marginTop: 190,
    color: "#FFF",
    fontSize: 13,
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

  // Preview
  previewBox: {
    marginTop: 12,
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  previewImg: { width: "100%", height: "100%" },
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

  // Submit overlay
  submitOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  submitText: { color: "#fff", fontWeight: "700" },
});
