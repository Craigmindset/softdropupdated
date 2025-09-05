import {
  Entypo,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";

import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  Modal,
  Platform,
  RefreshControl,
  StatusBar as RNStatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

const HEADER_BG = "#0B4D1C";

const Home = () => {
  const [showBalance, setShowBalance] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userShortCode, setUserShortCode] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [backPressCount, setBackPressCount] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeChecked, setWelcomeChecked] = useState(false);
  const [showProfileUpdate, setShowProfileUpdate] = useState(false);
  const backPressTimer = useRef<number | null>(null);
  const router = useRouter();
  const navigation = useNavigation();

  // Fetch user profile image, first name, and generate short code from user_id
  // Supabase logic removed

  // Supabase logic removed

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    // Supabase logic removed
    setRefreshing(false);
  };

  useEffect(() => {
    const onBackPress = () => {
      if (backPressCount === 0) {
        setBackPressCount(1);
        if (Platform.OS === "android") {
          ToastAndroid.show("Click twice to exit", ToastAndroid.SHORT);
        }
        if (backPressTimer.current) clearTimeout(backPressTimer.current);
        backPressTimer.current = setTimeout(
          () => setBackPressCount(0),
          2000
        ) as unknown as number;
        return true;
      } else {
        BackHandler.exitApp();
        return true;
      }
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => {
      sub.remove();
      if (backPressTimer.current) clearTimeout(backPressTimer.current);
    };
  }, [backPressCount]);

  // Welcome modal dismiss handler
  const handleWelcomeContinue = async () => {
    // Supabase logic removed
    setShowWelcomeModal(false);
  };

  // Image picker and upload handler
  // Supabase logic removed

  // Supabase logic removed

  // Block navigation if profile update is required
  // Supabase logic removed

  // Listen for profile update completion (to be called from SenderProfile after update)
  // Supabase logic removed

  // Supabase logic removed

  return (
    <>
      {/* Welcome Modal */}
      <Modal
        visible={showWelcomeModal && welcomeChecked}
        transparent
        animationType="fade"
        onRequestClose={handleWelcomeContinue}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 30,
              alignItems: "center",
              width: 320,
            }}
          >
            <LottieView
              source={require("../../assets/images/smiles.json")}
              autoPlay
              loop={false}
              style={{ width: 120, height: 120 }}
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginTop: 20,
                color: "#0B4D1C",
              }}
            >
              Welcome to SoftDrop!
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#333",
                marginTop: 10,
                textAlign: "center",
              }}
            >
              {" "}
              Making every Move Count
            </Text>

            <TouchableOpacity
              onPress={handleWelcomeContinue}
              style={{
                marginTop: 24,
                backgroundColor: "#0B4D1C",
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 40,
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <RNStatusBar
        backgroundColor={HEADER_BG}
        barStyle="light-content"
        translucent={false}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: HEADER_BG }}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: HEADER_BG,
              paddingTop:
                (Platform.OS === "android"
                  ? RNStatusBar.currentHeight || 24
                  : 44) + 12, // <-- add extra 12px padding
            },
          ]}
        >
          <View style={styles.profileSection}>
            <TouchableOpacity>
              <Image
                source={require("../../assets/images/placeholder-avatar.png")}
                style={styles.avatar}
              />
            </TouchableOpacity>
            <View>
              <Text style={styles.userName}>
                Hello,{" "}
                {firstName && firstName.trim().length > 0 ? firstName : "User"}
              </Text>
              <Text style={styles.userId}>
                User ID: {userShortCode ? userShortCode : "-----"}
              </Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <Ionicons name="qr-code" size={24} color="white" />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={{
              paddingTop: 0,
              paddingBottom: 60,
              marginBottom: 40,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#0B4D1C"
                colors={["#0B4D1C"]}
              />
            }
            keyboardShouldPersistTaps="handled"
          >
            {/* Digital Rewards */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              {/* Digital Rewards Button */}
              <TouchableOpacity style={styles.rewardsButton}>
                <Text style={styles.rewardsText}>Digital rewards ⭐</Text>
              </TouchableOpacity>
              {/* Icons Row */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity style={{ marginHorizontal: 6 }}>
                  <Ionicons
                    name="notifications-outline"
                    size={18}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity style={{ marginHorizontal: 6 }}>
                  <MaterialIcons name="support-agent" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={{ marginHorizontal: 6 }}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={18}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </View>
            {/* Wallet */}
            <View style={styles.walletCard}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <Text style={[styles.walletTitle, { fontSize: 12 }]}>
                  Smart Wallet
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={[
                      styles.walletNumber,
                      { marginLeft: 0, marginBottom: 0 },
                    ]}
                  >
                    38231112378
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Clipboard.setStringAsync("38231112378");
                      if (Platform.OS === "android") {
                        ToastAndroid.show(
                          "Copied to clipboard!",
                          ToastAndroid.SHORT
                        );
                      } else {
                        Alert.alert("Copied to clipboard!");
                      }
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    <Ionicons name="copy-outline" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
              {/* Balance Section */}
              <View style={styles.balanceSection}>
                <View style={styles.balanceBox}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.balanceTitle}>Available Balance</Text>
                    <TouchableOpacity
                      onPress={() => setShowBalance((prev) => !prev)}
                    >
                      <Ionicons
                        name={showBalance ? "eye-outline" : "eye-off-outline"}
                        size={14}
                        color="gray"
                        style={{ marginLeft: 6 }}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.balanceAmount}>
                    {showBalance ? "₦130,000.02" : "******"}
                  </Text>
                </View>
                <View style={styles.balanceBox}>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text style={styles.balanceTitle}>escrow account</Text>
                    <Text
                      style={[
                        styles.balanceAmount,
                        { fontSize: 14, marginTop: 4, marginRight: 10 },
                      ]}
                    >
                      ₦25,000.00
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => router.push("/")}
                >
                  <Text style={styles.actionText}>Transfer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.plusBtn}
                  onPress={() => router.push("/")}
                >
                  <Text style={styles.plusText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionText}>esc.Transact</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Logistics & Transport */}
            <Text style={[styles.sectionTitle, { fontSize: 12 }]}>
              Logistics & Transport
            </Text>
            <View
              style={[
                styles.rowContainer,
                {
                  flexWrap: "nowrap",
                  paddingLeft: 8,
                  paddingRight: 8,
                  justifyContent: "space-between",
                  backgroundColor: "white",
                  height: 100,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.gridItem,
                  {
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    marginHorizontal: 2,
                  },
                ]}
                onPress={() => router.push("/")}
              >
                <Entypo name="location-pin" size={20} color="orangered" />
                <Text
                  style={{
                    letterSpacing: -0.5,
                    fontWeight: "bold",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  Send a Parcel
                </Text>
                <Text style={{ fontSize: 8, marginTop: 0 }}>
                  Pair a Carrier
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.gridItem,
                  {
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    marginHorizontal: 2,
                  },
                ]}
              >
                <FontAwesome name="cutlery" size={18} color="salmon" />
                <Text
                  style={{
                    letterSpacing: -0.5,
                    fontWeight: "bold",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  Soft-eat
                </Text>
                <Text style={{ fontSize: 8, marginTop: 0 }}>Food Request</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.gridItem,
                  {
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    marginHorizontal: 2,
                  },
                ]}
              >
                <MaterialIcons name="inbox" size={20} color="gold" />
                <Text
                  style={{
                    letterSpacing: -0.5,
                    fontWeight: "bold",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  Receiver
                </Text>
                <Text style={{ fontSize: 8, marginTop: 0 }}>
                  Receive an Item
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.gridItem,
                  {
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    marginHorizontal: 2,
                  },
                ]}
              >
                <MaterialIcons name="event" size={20} color="tomato" />
                <Text
                  style={{
                    letterSpacing: -0.5,
                    fontWeight: "bold",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  Set Pick-up
                </Text>
                <Text style={{ fontSize: 8, marginTop: 0 }}>
                  Schdule a Pickup
                </Text>
              </TouchableOpacity>
            </View>

            {/* Finance & Rewards */}
            <Text style={[styles.sectionTitle, { fontSize: 12 }]}>
              Finance & Rewards
            </Text>
            <View
              style={[
                styles.rowContainer,
                {
                  flexWrap: "nowrap",
                  paddingLeft: 8,
                  paddingRight: 8,
                  justifyContent: "space-between",
                  backgroundColor: "white",
                  paddingVertical: 15,
                  flexDirection: "column",
                  flex: 1,
                  marginBottom: 0, // further reduced spacing under Finance & Rewards
                },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "white",
                  marginTop: 20,
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.gridItem,
                    {
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                      marginHorizontal: 2,
                    },
                  ]}
                >
                  <Entypo name="wallet" size={20} color="orangered" />
                  <Text
                    style={{
                      letterSpacing: -0.5,
                      fontWeight: "bold",
                      fontSize: 12,
                    }}
                  >
                    Softpay
                  </Text>
                  <Text style={{ fontSize: 8, marginTop: 0 }}>
                    smart wallet
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.gridItem,
                    {
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                      marginHorizontal: 2,
                    },
                  ]}
                >
                  <FontAwesome name="cutlery" size={18} color="salmon" />
                  <Text
                    style={{
                      letterSpacing: -0.5,
                      fontWeight: "bold",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Rewards
                  </Text>
                  <Text style={{ fontSize: 8, marginTop: 0 }}>
                    earned points
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.gridItem,
                    {
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                      marginHorizontal: 2,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="wallet-giftcard"
                    size={20}
                    color="gold"
                  />
                  <Text
                    style={{
                      letterSpacing: -0.5,
                      fontWeight: "bold",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Wallet
                  </Text>
                  <Text style={{ fontSize: 8, marginTop: 0 }}>e-wallet</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.gridItem,
                    {
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                      marginHorizontal: 2,
                    },
                  ]}
                >
                  <MaterialIcons name="savings" size={20} color="tomato" />
                  <Text
                    style={{
                      letterSpacing: -0.5,
                      fontWeight: "bold",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Box Save
                  </Text>
                  <Text style={{ fontSize: 8, marginTop: 0 }}>
                    locked savings
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Additional Actions */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "white",
                  marginTop: 20,
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.gridItem,
                    {
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                      marginHorizontal: 2,
                    },
                  ]}
                >
                  <Entypo name="mobile" size={20} color="orangered" />
                  <Text
                    style={{
                      letterSpacing: -0.5,
                      fontWeight: "bold",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Airtime
                  </Text>
                  <Text style={{ fontSize: 8, marginTop: 0 }}>Recharge</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.gridItem,
                    {
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                      marginHorizontal: 2,
                    },
                  ]}
                >
                  <Entypo name="network" size={18} color="salmon" />
                  <Text
                    style={{
                      letterSpacing: -0.5,
                      fontWeight: "bold",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Data Bundle
                  </Text>
                  <Text style={{ fontSize: 8, marginTop: 0 }}>
                    Internet Service
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.gridItem,
                    {
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                      marginHorizontal: 2,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="sports-football"
                    size={20}
                    color="gold"
                  />
                  <Text
                    style={{
                      letterSpacing: -0.5,
                      fontWeight: "bold",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Betting
                  </Text>
                  <Text style={{ fontSize: 8, marginTop: 0 }}>
                    betting topup
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.gridItem,
                    {
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                      marginHorizontal: 2,
                    },
                  ]}
                >
                  <MaterialIcons name="movie" size={20} color="tomato" />
                  <Text
                    style={{
                      letterSpacing: -0.5,
                      fontWeight: "bold",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Movies
                  </Text>
                  <Text style={{ fontSize: 8, marginTop: 0 }}>
                    Book a Ticket
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Repeat the grid items for the second row ------------------------------------*/}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "white",
                  marginTop: 20,
                  marginBottom: 20,
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.gridItem,
                    {
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                      marginHorizontal: 2,
                    },
                  ]}
                >
                  <MaterialIcons name="flight" size={20} color="orangered" />
                  <Text
                    style={{
                      letterSpacing: -0.5,
                      fontWeight: "bold",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Flight
                  </Text>
                  <Text style={{ fontSize: 8, marginTop: 0 }}>
                    Flight Booking
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.gridItem,
                    {
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                      marginHorizontal: 2,
                    },
                  ]}
                >
                  <MaterialIcons name="hotel" size={18} color="salmon" />
                  <Text
                    style={{
                      letterSpacing: -0.5,
                      fontWeight: "bold",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Hotels
                  </Text>
                  <Text style={{ fontSize: 8, marginTop: 0 }}>
                    Reservations
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.gridItem,
                    {
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                      marginHorizontal: 2,
                    },
                  ]}
                >
                  <MaterialIcons name="directions-car" size={20} color="gold" />
                  <Text
                    style={{
                      letterSpacing: -0.5,
                      fontWeight: "bold",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Smart Ride
                  </Text>
                  <Text style={{ fontSize: 8, marginTop: 0 }}>
                    Ride Booking
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.gridItem,
                    {
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                      marginHorizontal: 2,
                    },
                  ]}
                >
                  <MaterialIcons name="emoji-people" size={20} color="tomato" />
                  <Text
                    style={{
                      letterSpacing: -0.5,
                      fontWeight: "bold",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Enterprise
                  </Text>
                  <Text style={{ fontSize: 8, marginTop: 0 }}>
                    Global Connect
                  </Text>
                </TouchableOpacity>
              </View>
              {/* </ Finance & Rewards Grid 4-------------------------------------------------*/}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0B4D1C",
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",

    paddingVertical: 10,
    alignItems: "center",
    // backgroundColor will be set inline above
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    color: "white",
    fontWeight: "medium",
    fontSize: 15,
  },
  userId: {
    color: "#ccc",
    fontSize: 12,
  },
  headerIcons: {
    flexDirection: "row",
    marginRight: 25,
  },
  rewardsButton: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  rewardsText: {
    color: "white",
    fontSize: 10,
    marginLeft: 5,
  },
  walletCard: {
    backgroundColor: "#1AB157",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  walletTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  walletNumber: {
    color: "white",
    fontSize: 12,
    marginBottom: 10,
  },
  balanceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  balanceBox: {
    backgroundColor: "white",
    paddingRight: 10,
    paddingLeft: 15,
    paddingTop: 10,
    paddingBottom: 6,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 2,
  },
  balanceTitle: {
    fontSize: 12,
    color: "gray",
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionBtn: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  actionText: {
    color: "white",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "medium",
  },
  plusBtn: {
    backgroundColor: "red",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  plusText: {
    color: "white",
    fontSize: 24,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  gridContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  rowContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  gridItem: {
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 10,
  },
});

export default Home;
