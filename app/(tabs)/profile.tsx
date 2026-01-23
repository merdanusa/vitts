import { logout as apiLogout, getCurrentUser } from "@/services/api";
import { RootState } from "@/store";
import { logout as logoutAction } from "@/store/userSlice";
import { useRouter } from "expo-router";
import { Radio, Settings, Share2 } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = 60;
const AVATAR_SIZE = 120;
const HEADER_EXPANDED_HEIGHT = 300;

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isDark = useSelector((state: RootState) => state.theme.isDark);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProfile();
  }, []);

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

  // Avatar animations based on scroll
  const avatarScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.5, 1],
    extrapolate: "clamp",
  });

  const avatarTranslateY = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [-50, 0],
    extrapolate: "clamp",
  });

  const headerHeight = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [HEADER_EXPANDED_HEIGHT + 100, HEADER_EXPANDED_HEIGHT],
    extrapolate: "clamp",
  });

  const avatarBorderRadius = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [0, AVATAR_SIZE / 2],
    extrapolate: "clamp",
  });

  const avatarWidth = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [width, AVATAR_SIZE],
    extrapolate: "clamp",
  });

  const avatarHeight = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [width, AVATAR_SIZE],
    extrapolate: "clamp",
  });

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
      {/* Fixed Header */}
      <View
        style={{
          borderBottomColor: isDark ? "#262626" : "#dbdbdb",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
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

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
      >
        {/* Expandable Avatar Header */}
        <Animated.View
          style={{
            height: headerHeight,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{
              transform: [
                { translateY: avatarTranslateY },
                { scale: avatarScale },
              ],
            }}
          >
            {user.avatar && user.avatar !== "M" ? (
              <Animated.Image
                source={{ uri: user.avatar }}
                style={{
                  width: avatarWidth,
                  height: avatarHeight,
                  borderRadius: avatarBorderRadius,
                }}
              />
            ) : (
              <Animated.View
                style={{
                  backgroundColor: isDark ? "#262626" : "#f3f4f6",
                  width: avatarWidth,
                  height: avatarHeight,
                  borderRadius: avatarBorderRadius,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: isDark ? "#a1a1aa" : "#9ca3af" }}
                  className="text-5xl font-bold"
                >
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </Animated.View>
            )}
          </Animated.View>
        </Animated.View>

        <View className="px-4 py-6">
          <View className="items-center mb-6">
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
      </Animated.ScrollView>
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
            }}
            className="h-4 rounded mb-2"
            style={{ width: "60%" }}
          />
          <View
            style={{
              backgroundColor: isDark ? "#1f1f1f" : "#f3f4f6",
            }}
            className="h-3 rounded"
            style={{ width: "40%" }}
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
