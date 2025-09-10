import React from "react";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { View, StyleSheet } from "react-native";

export type LatLng = { latitude: number; longitude: number };
export type AppMapMarker = {
  key: string;
  coordinate: LatLng;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
};
export type AppMapPolyline = {
  coordinates: LatLng[];
  color?: string;
  width?: number;
};

interface AppMapProps {
  initialRegion: LatLng & { latitudeDelta: number; longitudeDelta: number };
  markers?: AppMapMarker[];
  polylines?: AppMapPolyline[];
  style?: any;
  children?: React.ReactNode;
}

const AppMap: React.FC<AppMapProps> = ({
  initialRegion,
  markers = [],
  polylines = [],
  style,
  children,
}) => (
  <View style={[styles.container, style]}>
    <MapView
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      customMapStyle={darkMapStyle}
      userInterfaceStyle="light"
      showsUserLocation
      showsMyLocationButton
      zoomEnabled
      scrollEnabled
    >
      {markers.map((m) => (
        <Marker
          key={m.key}
          coordinate={m.coordinate}
          title={m.title}
          description={m.description}
        >
          {m.icon}
        </Marker>
      ))}
      {polylines.map((p, idx) => (
        <Polyline
          key={idx}
          coordinates={p.coordinates}
          strokeColor={p.color || "#2F7E5D"}
          strokeWidth={p.width || 3}
          lineCap="round"
          lineJoin="round"
          geodesic
        />
      ))}
      {children}
    </MapView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
});

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1b1b1b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8a8a" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#373737" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3c3c3c" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#3c3c3c" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#212121" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d3d3d" }],
  },
];

export default AppMap;
