import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

const COLOR = {
  brand: "#2F7E5D",
  bg: "#e8f5e9",
  sheet: "#fff",
  text: "#0B0F0E",
  sub: "#6B7280",
  border: "rgba(0,0,0,0.08)",
};

export default function Accept() {
  const params = useLocalSearchParams();
  const origin = {
    latitude: Number(params.sender_latitude) || 6.5244,
    longitude: Number(params.sender_longitude) || 3.3792,
  };
  const destination = {
    latitude: Number(params.receiver_latitude) || 6.465422,
    longitude: Number(params.receiver_longitude) || 3.406448,
  };
  const senderAddress = String(params.sender_location || "Sender address");
  const receiverAddress = String(
    params.receiver_location || "Receiver address"
  );
  const carrierName = String(params.carrier_name || "Carrier Name");
  const carrierPhone = String(params.carrier_phone || "Carrier Phone");
  const carrierType = String(params.carrier_type || "Carrier Type");
  const itemType = String(params.itemType || params.item_type || "Item Type");
  const receiverName = String(
    params.receiverName || params.receiver_name || "Receiver Name"
  );
  const receiverContact = String(
    params.receiverContact || params.receiver_contact || "Receiver Phone"
  );
  const estimatedPrice = String(
    params.estimated_price || params.amount || "₦8,200"
  );
  const avatarUrl = String(
    params.carrier_photo_url ||
      "https://randomuser.me/api/portraits/women/44.jpg"
  );

  // Drawer animation
  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const drawerMaxHeight = SCREEN_HEIGHT * 0.7;
  const drawerMinHeight = SCREEN_HEIGHT * 0.4;
  const [drawerHeight] = useState(new Animated.Value(drawerMaxHeight));
  const [drawerOpen, setDrawerOpen] = useState(true);
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 10,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 40) {
            Animated.timing(drawerHeight, {
              toValue: drawerMinHeight,
              duration: 250,
              useNativeDriver: false,
            }).start(() => setDrawerOpen(false));
          } else if (gestureState.dy < -40) {
            Animated.timing(drawerHeight, {
              toValue: drawerMaxHeight,
              duration: 250,
              useNativeDriver: false,
            }).start(() => setDrawerOpen(true));
          }
        },
      }),
    [drawerHeight, drawerMaxHeight, drawerMinHeight]
  );
  React.useEffect(() => {
    Animated.timing(drawerHeight, {
      toValue: drawerOpen ? drawerMaxHeight : drawerMinHeight,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [drawerOpen, drawerHeight, drawerMaxHeight, drawerMinHeight]);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: (origin.latitude + destination.latitude) / 2,
          longitude: (origin.longitude + destination.longitude) / 2,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
        userInterfaceStyle="light"
      >
        <Marker coordinate={origin} title="Pickup" />
        <Marker coordinate={destination} title="Drop-off" />
      </MapView>
      {/* Drawer Overlay */}
      <Animated.View
        style={[styles.drawer, { height: drawerHeight }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.drawerHandle}>
          <View style={styles.drawerBar} />
        </View>
        <View style={styles.profileRow}>
          <Image source={{ uri: avatarUrl }} style={styles.profileImg} />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={styles.carrierName}>{carrierName}</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <MaterialCommunityIcons
                name="phone"
                size={18}
                color={COLOR.brand}
              />
              <Text style={styles.carrierPhone}>{carrierPhone}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <MaterialCommunityIcons
                name="truck-delivery"
                size={18}
                color={COLOR.brand}
              />
              <Text style={styles.carrierType}>{carrierType}</Text>
            </View>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailList}>
          <DetailRow
            label="Item Type"
            value={itemType}
            icon={
              <MaterialCommunityIcons
                name="package-variant"
                size={18}
                color={COLOR.brand}
              />
            }
          />
          <DetailRow
            label="Pick-up"
            value={senderAddress}
            icon={
              <MaterialCommunityIcons
                name="map-marker"
                size={18}
                color={COLOR.brand}
              />
            }
          />
          <DetailRow
            label="Drop-off"
            value={receiverAddress}
            icon={
              <MaterialCommunityIcons
                name="map-marker-check"
                size={18}
                color={COLOR.brand}
              />
            }
          />
          <DetailRow
            label="Receiver Name"
            value={receiverName}
            icon={
              <MaterialCommunityIcons
                name="account"
                size={18}
                color={COLOR.brand}
              />
            }
          />
          <DetailRow
            label="Receiver Phone"
            value={receiverContact}
            icon={
              <MaterialCommunityIcons
                name="phone"
                size={18}
                color={COLOR.brand}
              />
            }
          />
          <DetailRow
            label="Estimated Price"
            value={estimatedPrice}
            icon={
              <MaterialCommunityIcons
                name="cash"
                size={18}
                color={COLOR.brand}
              />
            }
          />
        </View>
      </Animated.View>
    </View>
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}
    >
      <View
        style={{
          width: 28,
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.bg },
  map: { flex: 1 },
  drawer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLOR.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  drawerHandle: {
    alignItems: "center",
    marginBottom: 12,
  },
  drawerBar: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLOR.border,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  profileImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#eee",
    borderWidth: 2,
    borderColor: COLOR.brand,
  },
  carrierName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLOR.text,
  },
  carrierPhone: {
    fontSize: 15,
    color: COLOR.sub,
    marginLeft: 8,
  },
  carrierType: {
    fontSize: 15,
    color: COLOR.sub,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLOR.border,
    marginVertical: 16,
  },
  detailList: {
    marginTop: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: COLOR.sub,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: COLOR.text,
    fontWeight: "500",
  },
});
