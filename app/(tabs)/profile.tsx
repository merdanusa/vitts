import { logout as apiLogout, getCurrentUser } from "@/services/api";
import { RootState } from "@/store";
import { logout as logoutAction } from "@/store/userSlice";
import { useRouter } from "expo-router";
import { Ban, Info, Radio, Settings, Share2, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const { width, height } = Dimensions.get("window");
const AVATAR_SIZE = 120;

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isDark = useSelector((state: RootState) => state.theme.isDark);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (avatarModalVisible) {
      scaleAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }).start();
    }
  }, [avatarModalVisible]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentUser();
      setUser(data);
    } catch (err: any) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await apiLogout();
          dispatch(logoutAction());
          router.replace("/auth");
        },
      },
    ]);
  };

  const openAvatarModal = () => {
    setAvatarModalVisible(true);
  };

  const closeAvatarModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setAvatarModalVisible(false);
    });
  };

  const handleShare = () => {
    Alert.alert("Share", "Share profile feature");
    closeAvatarModal();
  };

  const handleInfo = () => {
    Alert.alert("Info", "View profile info feature");
    closeAvatarModal();
  };

  const handleBlock = () => {
    Alert.alert("Block", "Block user feature", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Block",
        style: "destructive",
        onPress: () => {
          closeAvatarModal();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1 justify-center items-center"
      >
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1 justify-center items-center"
      >
        <Text className="text-red-500 text-base">
          {error || "No profile data"}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      <View
        style={{
          borderBottomColor: isDark ? "#262626" : "#dbdbdb",
          backgroundColor: isDark ? "#000000" : "#ffffff",
        }}
        className="flex-row items-center justify-between px-4 py-3 border-b"
      >
        <View className="flex-1">
          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="text-xl font-bold"
          >
            {user.login}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} className="p-2">
          <Settings size={24} color={isDark ? "#ffffff" : "#000000"} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          <View className="items-center mb-6">
            <Pressable onLongPress={openAvatarModal} delayLongPress={300}>
              {user.avatar && user.avatar !== "M" ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={{
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    borderRadius: AVATAR_SIZE / 2,
                    marginBottom: 16,
                  }}
                />
              ) : (
                <View
                  style={{
                    backgroundColor: isDark ? "#262626" : "#f3f4f6",
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    borderRadius: AVATAR_SIZE / 2,
                    marginBottom: 16,
                  }}
                  className="items-center justify-center"
                >
                  <Text
                    style={{ color: isDark ? "#a1a1aa" : "#9ca3af" }}
                    className="text-5xl font-bold"
                  >
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </Text>
                </View>
              )}
            </Pressable>

            <Text
              style={{ color: isDark ? "#ffffff" : "#000000" }}
              className="text-xl font-bold mb-1"
            >
              {user.name}
            </Text>
            <Text
              style={{ color: isDark ? "#a1a1aa" : "#737373" }}
              className="text-sm mb-1"
            >
              @{user.login}
            </Text>
            {user.bio && user.bio !== "Hey there! I use this app." && (
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-sm text-center mt-2 px-8"
              >
                {user.bio}
              </Text>
            )}
          </View>

          <View className="flex-row gap-2 mb-6">
            <TouchableOpacity
              style={{
                backgroundColor: isDark ? "#262626" : "#efefef",
              }}
              className="flex-1 py-2.5 rounded-lg items-center"
            >
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-sm font-semibold"
              >
                Edit Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: isDark ? "#262626" : "#efefef",
              }}
              className="flex-1 py-2.5 rounded-lg flex-row items-center justify-center gap-2"
            >
              <Share2 size={16} color={isDark ? "#ffffff" : "#000000"} />
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-sm font-semibold"
              >
                Share
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              borderTopColor: isDark ? "#262626" : "#dbdbdb",
              paddingTop: 20,
            }}
            className="border-t"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-base font-semibold"
              >
                Suggested Friends
              </Text>
              <TouchableOpacity>
                <Text className="text-blue-500 text-sm font-semibold">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            <FriendSkeleton isDark={isDark} />
            <FriendSkeleton isDark={isDark} />
            <FriendSkeleton isDark={isDark} />
          </View>

          <View
            style={{
              borderTopColor: isDark ? "#262626" : "#dbdbdb",
              paddingTop: 20,
              marginTop: 20,
            }}
            className="border-t"
          >
            <View className="items-center py-12">
              <View
                style={{
                  borderColor: isDark ? "#262626" : "#dbdbdb",
                }}
                className="w-20 h-20 rounded-full border-2 items-center justify-center mb-4"
              >
                <Radio size={36} color={isDark ? "#a1a1aa" : "#737373"} />
              </View>
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-xl font-bold mb-2"
              >
                No VibeCasts Yet
              </Text>
              <Text
                style={{ color: isDark ? "#a1a1aa" : "#737373" }}
                className="text-sm text-center px-8"
              >
                When you create VibeCasts, they'll appear here.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={avatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeAvatarModal}
        statusBarTranslucent
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.95)" }}>
          <TouchableOpacity
            onPress={closeAvatarModal}
            style={{
              position: "absolute",
              top: 50,
              right: 20,
              zIndex: 10,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 20,
              padding: 8,
            }}
          >
            <X size={24} color="#ffffff" />
          </TouchableOpacity>

          <Pressable style={{ flex: 1 }} onPress={closeAvatarModal}>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Animated.View
                style={{
                  transform: [{ scale: scaleAnim }],
                }}
              >
                {user.avatar && user.avatar !== "M" ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={{
                      width: width * 0.9,
                      height: width * 0.9,
                      borderRadius: 12,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      backgroundColor: isDark ? "#262626" : "#f3f4f6",
                      width: width * 0.9,
                      height: width * 0.9,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{ color: isDark ? "#a1a1aa" : "#9ca3af" }}
                      className="text-8xl font-bold"
                    >
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </Text>
                  </View>
                )}
              </Animated.View>
            </View>
          </Pressable>

          <View
            style={{
              position: "absolute",
              bottom: 40,
              left: 0,
              right: 0,
              paddingHorizontal: 20,
            }}
          >
            <View className="flex-row gap-3 justify-center">
              <TouchableOpacity
                onPress={handleShare}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: 50,
                  padding: 16,
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Share2 size={24} color="#ffffff" />
                <Text className="text-white text-xs mt-2 font-semibold">
                  Share
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleInfo}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: 50,
                  padding: 16,
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Info size={24} color="#ffffff" />
                <Text className="text-white text-xs mt-2 font-semibold">
                  Info
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBlock}
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.25)",
                  borderRadius: 50,
                  padding: 16,
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Ban size={24} color="#ef4444" />
                <Text className="text-red-500 text-xs mt-2 font-semibold">
                  Block
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function FriendSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center flex-1">
        <View
          style={{
            backgroundColor: isDark ? "#262626" : "#e5e7eb",
          }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1">
          <View
            style={{
              backgroundColor: isDark ? "#262626" : "#e5e7eb",
              width: "60%",
            }}
            className="h-4 rounded mb-2"
          />
          <View
            style={{
              backgroundColor: isDark ? "#1f1f1f" : "#f3f4f6",
              width: "40%",
            }}
            className="h-3 rounded"
          />
        </View>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: "#3b82f6",
        }}
        className="px-6 py-1.5 rounded-lg"
      >
        <Text className="text-white text-sm font-semibold">Add</Text>
      </TouchableOpacity>
    </View>
  );
}
