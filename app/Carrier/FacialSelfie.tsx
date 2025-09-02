// Carrier/FacialSelfie.tsx
import React, { useRef, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FaceDetector from "expo-face-detector";

const GREEN = "#21C15A";
const TEXT = "#222222";
const MUTED = "#7A7F87";
const CARD = "#F6F7F8";
const PURPLE = "#6C4BFF"; // CTA like the mock
const TIP_BG = "#FBF6E9";
const TIP_ICON = "#C89A1B";

const GUIDE_W = 240; // inner oval width
const GUIDE_H = 300; // inner oval height

const FacialSelfie = () => {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const [stage, setStage] = useState<"intro" | "camera" | "preview">("intro");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  const [faceOk, setFaceOk] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFacesDetected = (event: any) => {
    const faces = event?.faces || [];
    setFaceOk(faces.length > 0);
    if (faces.length > 0 && errorMsg) setErrorMsg(null);
  };

  const begin = () => setStage("camera");

  const takeShot = async () => {
    if (!cameraRef.current) return;
    setErrorMsg(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: true,
        base64: false,
      });
      if (!photo?.uri) {
        setErrorMsg("Failed to capture photo. Please try again.");
        return;
      }
      // Run face detection on the captured image
      const faceResult = await FaceDetector.detectFacesAsync(photo.uri, {
        mode: FaceDetector.FaceDetectorMode.fast,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
        runClassifications: FaceDetector.FaceDetectorClassifications.none,
      });
      if (!faceResult.faces || faceResult.faces.length === 0) {
        setErrorMsg("No face detected. Please align your face in the oval and try again.");
        return;
      }
      setPhotoUri(photo.uri);
      setStage("preview");
    } catch (err) {
      setErrorMsg("An error occurred while capturing or analyzing the photo. Please try again.");
    }
  };

  const retake = () => {
    setPhotoUri(null);
    setStage("camera");
  };

  const confirm = () => {
    // TODO: upload photoUri / continue KYC flow
    console.log("Selfie captured:", photoUri);
  };

  // Permissions UI
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, { justifyContent: "center" }]}>
          <Text style={styles.title}>Camera Permission Needed</Text>
          <Text style={styles.subtitle}>
            Please allow camera access in your device settings to continue.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={[styles.ctaPurple, { marginTop: 16 }]}
          >
            <Text style={styles.ctaPurpleText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              if (stage === "camera" || stage === "preview") {
                setStage("intro");
                setPhotoUri(null);
              } else {
                router.back();
              }
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backBtn}
          >
            <MaterialIcons
              name="arrow-back-ios-new"
              size={22}
              color="#222"
              style={styles.backIcon}
            />
          </TouchableOpacity>
        </View>

        {stage === "intro" && (
          <>
            <Text style={[styles.title, { textAlign: "left", marginLeft: 2 }]}>
              Position your face within the frame
            </Text>

            {/* Grey rounded frame with big oval silhouette */}
            <View style={styles.frameWrap}>
              <View style={styles.ovalSilhouette} />
            </View>

            {/* Tip card */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconWrap}>
                <MaterialIcons name="info" size={16} color={TIP_ICON} />
              </View>
              <Text style={styles.tipText}>
                Make sure you are in a place where there is enough light to take
                a clear photo.
              </Text>
            </View>

            {/* CTA */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={begin}
              style={styles.ctaPurple}
            >
              <Text style={styles.ctaPurpleText}>Start Verification</Text>
            </TouchableOpacity>
          </>
        )}

        {stage === "camera" && (
          <View style={styles.cameraWrap}>
            <CameraView
              ref={cameraRef}
              facing="front"
              style={styles.camera}
              ratio="16:9"
            />

            {/* Overlay with oval guide & dim background */}
            <View pointerEvents="none" style={styles.overlayRoot}>
              {/* Dim everything */}
              <View style={styles.dim} />
              {/* Cutout container (we simulate cutout by drawing a white/bright border for the oval) */}
              <View style={styles.ovalGuide} />
              <Text style={styles.overlayText}>
                Align your face in the oval
              </Text>
            </View>

            {/* Error message if no face detected */}
            {errorMsg && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
                <TouchableOpacity onPress={() => setErrorMsg(null)} style={styles.errorDismissBtn}>
                  <Text style={styles.errorDismissText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={takeShot}
              style={styles.captureBtn}
            >
              <Text style={styles.captureText}>Capture</Text>
            </TouchableOpacity>
	  </View>
        )}


        {stage === "preview" && (
          <View style={{ flex: 1 }}>
            <View style={styles.previewBox}>
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={styles.preview}
                  resizeMode="cover"
                />
              ) : null}
            </View>
            <View style={styles.row}>
              <Pressable
                onPress={retake}
                style={[styles.actionBtn, styles.outlineBtn]}
              >
                <Text style={[styles.actionText, { color: PURPLE }]}>
                  Retake
                </Text>
              </Pressable>
              <Pressable
                onPress={confirm}
                style={[styles.actionBtn, styles.fillBtn]}
              >
                <Text style={[styles.actionText, { color: "#fff" }]}>
                  Use Photo
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default FacialSelfie;

const styles = StyleSheet.create({
  errorBox: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 90,
    backgroundColor: "#fff8f0",
    borderColor: "#ffb300",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    color: "#b85c00",
    fontSize: 15,
    marginBottom: 6,
    textAlign: "center",
    fontWeight: "600",
  },
  errorDismissBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#ffe0b2",
    borderRadius: 8,
  },
  errorDismissText: {
    color: "#b85c00",
    fontWeight: "700",
    fontSize: 14,
  },
  safe: { flex: 1, backgroundColor: "#FFF" },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: "#FFF",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },

  topBar: { height: 44, justifyContent: "center" },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { backgroundColor: "#F3F4F6", borderRadius: 18, padding: 7 },

  title: { marginTop: 6, fontSize: 18, fontWeight: "700", color: TEXT },

  // Frame like mock
  frameWrap: {
    marginTop: 14,
    backgroundColor: "#ECEFF3",
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  ovalSilhouette: {
    width: GUIDE_W,
    height: GUIDE_H,
    backgroundColor: "#151515",
    borderRadius: GUIDE_W, // big radius → oval
  },

  // Tip card
  tipCard: {
    marginTop: 18,
    backgroundColor: TIP_BG,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  tipIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tipText: { flex: 1, color: "#6A5E3B", fontSize: 13, lineHeight: 18 },

  // Purple CTA
  ctaPurple: {
    marginTop: 22,
    backgroundColor: GREEN,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  ctaPurpleText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },

  // Camera stage
  cameraWrap: {
    flex: 1,
    marginTop: 12,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  camera: { flex: 1 },

  overlayRoot: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  // Dim overlay (simple — we’re not punching a real hole; see note below)
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  // Bright oval guide drawn on top of the dim
  ovalGuide: {
    width: GUIDE_W,
    height: GUIDE_H,
    borderRadius: GUIDE_W,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
  },
  overlayText: { marginTop: 14, color: "#FFF", fontSize: 14 },

  captureBtn: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: GREEN,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  captureText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Preview
  previewBox: {
    marginTop: 10,
    height: 420,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  preview: { width: "100%", height: "100%" },
  row: { flexDirection: "row", gap: 12, marginTop: 16 },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: GREEN,
  },
  outlineBtn: { backgroundColor: GREEN, borderColor: GREEN },
  fillBtn: { backgroundColor: GREEN, borderColor: GREEN },
  actionText: { fontSize: 15, fontWeight: "700" },
});
