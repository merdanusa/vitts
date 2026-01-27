import { createOrGetChat, getUserStatus } from "@/services/api";
import { RootState } from "@/store";
import { getInitials } from "@/utils/helpers";
import { getOnlineStatus } from "@/utils/lastSeen";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  MessageCircle,
  Phone,
  Share2,
  Video,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const AVATAR_SIZE = 120;

interface UserProfileData {
  id: string;
  name: string;
  login: string;
  avatar: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: string | null;
}

const RippleButton: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onPress, children, disabled }) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useSelector((state: RootState) => state.theme.isDark);

  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await getUserStatus(id);

      setUser({
        id: status.userId,
        name: status.name,
        login: `@${status.name.toLowerCase().replace(/\s/g, "")}`,
        avatar: status.avatar,
        bio: "",
        isOnline: status.isOnline,
        lastSeen: status.lastSeen,
      });
    } catch (err: any) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      setCreatingChat(true);
      const chat = await createOrGetChat({ otherUserId: id });
      router.push(`/chats/${chat.id}`);
    } catch (err: any) {
      Alert.alert("Error", "Failed to create chat");
      console.error(err);
    } finally {
      setCreatingChat(false);
    }
  };

  const handleVoiceCall = () => {
    Alert.alert("Voice Call", "Voice calling feature coming soon!");
  };

  const handleVideoCall = () => {
    Alert.alert("Video Call", "Video calling feature coming soon!");
  };

  const handleShare = () => {
    Alert.alert("Share", "Share profile feature coming soon!");
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1 justify-center items-center"
      >
        <ActivityIndicator
          size="small"
          color={isDark ? "#ffffff" : "#000000"}
        />
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1 justify-center items-center"
      >
        <Text
          style={{ color: isDark ? "#ef4444" : "#dc2626" }}
          className="text-base"
        >
          {error || "No profile data"}
        </Text>
      </SafeAreaView>
    );
  }

  const hasAvatar = user?.avatar && user.avatar !== "M" && user.avatar !== "";
  const initials = user ? getInitials(user.name) : "";

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      <View className="relative overflow-hidden">
        <View
          className={`absolute inset-0 ${isDark ? "bg-black/75" : "bg-white/80"}`}
        />

        <View
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-br from-gray-800/50 via-gray-850/30 to-gray-900/60"
              : "bg-gradient-to-br from-white/70 via-gray-50/40 to-gray-100/50"
          }`}
        />

        <View
          className={`absolute inset-0 ${
            isDark ? "bg-gray-900/20" : "bg-white/30"
          }`}
        />

        <View
          className={`absolute bottom-0 left-0 right-0 h-px ${
            isDark
              ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
              : "bg-gradient-to-r from-transparent via-gray-500/30 to-transparent"
          }`}
        />

        <View className="relative flex-row items-center justify-between px-4 py-3">
          <RippleButton onPress={() => router.back()}>
            <View className="p-2">
              <ChevronLeft
                size={26}
                color={isDark ? "#f9fafb" : "#111827"}
                strokeWidth={2.5}
              />
            </View>
          </RippleButton>

          <Text
            className={`text-[17px] font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Profile
          </Text>

          <View className="w-10" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center pt-8 pb-6">
          <View className="relative mb-4">
            {user.isOnline && (
              <View className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-md" />
            )}

            <View
              className={`rounded-full p-1 ${
                user.isOnline
                  ? isDark
                    ? "bg-gradient-to-br from-emerald-400 to-teal-500"
                    : "bg-gradient-to-br from-emerald-500 to-teal-600"
                  : isDark
                    ? "bg-gray-700/50"
                    : "bg-gray-300/50"
              }`}
              style={{ width: AVATAR_SIZE + 8, height: AVATAR_SIZE + 8 }}
            >
              {hasAvatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                  className="rounded-full"
                />
              ) : (
                <View
                  className={`rounded-full items-center justify-center ${
                    isDark ? "bg-gray-700" : "bg-gray-200"
                  }`}
                  style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                >
                  <Text
                    className={`text-4xl font-bold ${
                      isDark ? "text-gray-100" : "text-gray-700"
                    }`}
                  >
                    {initials}
                  </Text>
                </View>
              )}
            </View>

            {user.isOnline && (
              <View className="absolute bottom-2 right-2">
                <Animated.View
                  className="absolute inset-0 w-6 h-6 rounded-full bg-emerald-400/40"
                  style={{ transform: [{ scale: pulseAnim }] }}
                />
                <View
                  className={`w-6 h-6 rounded-full bg-emerald-500 border-[3px] ${
                    isDark ? "border-black" : "border-white"
                  }`}
                />
              </View>
            )}
          </View>

          <Text
            className={`text-2xl font-bold mb-1 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {user.name}
          </Text>

          <Text
            className={`text-[15px] ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {user.login}
          </Text>

          <View
            className="flex-row items-center mt-6 px-4 w-full"
            style={{ gap: 12 }}
          >
            <View className="flex-1">
              <RippleButton onPress={handleShare}>
                <View
                  className={`flex-row items-center justify-center py-3 rounded-xl ${
                    isDark ? "bg-gray-800/60" : "bg-gray-100/70"
                  }`}
                >
                  <Share2
                    size={18}
                    color={isDark ? "#f9fafb" : "#111827"}
                    strokeWidth={2.2}
                  />
                  <Text
                    className={`font-semibold text-[15px] ml-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Share
                  </Text>
                </View>
              </RippleButton>
            </View>
          </View>

          <View
            className="flex-row items-center mt-3 px-4 w-full"
            style={{ gap: 12 }}
          >
            <View className="flex-1">
              <RippleButton onPress={handleMessage} disabled={creatingChat}>
                <View
                  className={`flex-row items-center justify-center py-3 rounded-xl ${
                    creatingChat
                      ? isDark
                        ? "bg-blue-600/50"
                        : "bg-blue-500/50"
                      : isDark
                        ? "bg-blue-600"
                        : "bg-blue-500"
                  }`}
                >
                  {creatingChat ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <MessageCircle
                        size={18}
                        color="#ffffff"
                        strokeWidth={2.2}
                      />
                      <Text className="text-white font-semibold text-[15px] ml-2">
                        Message
                      </Text>
                    </>
                  )}
                </View>
              </RippleButton>
            </View>

            <RippleButton onPress={handleVoiceCall}>
              <View
                className={`p-3 rounded-xl ${
                  isDark ? "bg-gray-800/60" : "bg-gray-100/70"
                }`}
              >
                <Phone
                  size={20}
                  color={isDark ? "#f9fafb" : "#111827"}
                  strokeWidth={2.2}
                />
              </View>
            </RippleButton>

            <RippleButton onPress={handleVideoCall}>
              <View
                className={`p-3 rounded-xl ${
                  isDark ? "bg-gray-800/60" : "bg-gray-100/70"
                }`}
              >
                <Video
                  size={20}
                  color={isDark ? "#f9fafb" : "#111827"}
                  strokeWidth={2.2}
                />
              </View>
            </RippleButton>
          </View>
        </View>

        <View className="px-4 pb-6">
          <View
            className="p-4 rounded-2xl"
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
            }}
          >
            <Text
              className={`text-xs font-semibold mb-3 uppercase tracking-wider ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              Info
            </Text>

            <View className="mb-4">
              <View className="mb-4">
                <Text
                  className={`text-xs font-medium mb-1 ${
                    isDark ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  Last seen at:
                </Text>
                <Text
                  className={`text-[15px] ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {getOnlineStatus(user.isOnline, user.lastSeen)}
                </Text>
              </View>
              <View className="mb-4">
                <Text
                  className={`text-xs font-medium mb-1 ${
                    isDark ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  Joined at:
                </Text>
                <Text
                  className={`text-[15px] ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  created at here
                </Text>
              </View>
              <View>
                <Text
                  className={`text-xs font-medium mb-1 ${
                    isDark ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  Status
                </Text>
                <Text
                  className={`text-[15px] font-semibold ${
                    user.isOnline
                      ? "text-emerald-500"
                      : isDark
                        ? "text-gray-400"
                        : "text-gray-500"
                  }`}
                >
                  {user.isOnline ? "Online" : "Offline"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
