import { Share2 } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfileHeaderProps {
  user: any;
  isDark: boolean;
  uploadingAvatar: boolean;
  onAvatarLongPress: () => void;
  onEditPress: () => void;
  onSharePress: () => void;
  avatarSize: number;
}

export function ProfileHeader({
  user,
  isDark,
  uploadingAvatar,
  onAvatarLongPress,
  onEditPress,
  onSharePress,
  avatarSize,
}: ProfileHeaderProps) {
  const displayAvatar =
    user.avatar && user.avatar !== "M" && user.avatar !== "";

  return (
    <>
      <View className="items-center mb-6">
        <Pressable onLongPress={onAvatarLongPress} delayLongPress={300}>
          <View>
            {displayAvatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                  marginBottom: 16,
                }}
              />
            ) : (
              <View
                style={{
                  backgroundColor: isDark ? "#262626" : "#f3f4f6",
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
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
            {uploadingAvatar && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 16,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  borderRadius: avatarSize / 2,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            )}
          </View>
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
          onPress={onEditPress}
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
          onPress={onSharePress}
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
    </>
  );
}
    