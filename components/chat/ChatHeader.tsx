import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { getInitials } from "../../../../utils/helpers";

interface ChatHeaderProps {
  isDark: boolean;
  participant: any;
  isTyping: boolean;
  onBack: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  isDark,
  participant,
  isTyping,
  onBack,
}) => {
  const hasAvatar =
    participant?.avatar &&
    participant.avatar !== "M" &&
    participant.avatar !== "";
  const initials = participant ? getInitials(participant.name) : "";

  return (
    <View
      style={{
        borderBottomWidth: 0.5,
        borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
        backgroundColor: isDark ? "#000000" : "#ffffff",
      }}
      className="px-4 py-3"
    >
      <View className="flex-row items-center">
        <TouchableOpacity activeOpacity={0.6} onPress={onBack} className="mr-3">
          <ChevronLeft size={28} color={isDark ? "#ffffff" : "#007AFF"} />
        </TouchableOpacity>

        <View className="mr-3 relative">
          {hasAvatar ? (
            <Image
              source={{ uri: participant.avatar }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          ) : (
            <View
              style={{
                backgroundColor: isDark ? "#262626" : "#f3f4f6",
                width: 40,
                height: 40,
                borderRadius: 20,
              }}
              className="items-center justify-center"
            >
              <Text
                style={{ color: isDark ? "#a1a1aa" : "#737373" }}
                className="text-sm font-medium"
              >
                {initials}
              </Text>
            </View>
          )}
          {participant?.isOnline && (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                backgroundColor: "#22c55e",
                borderRadius: 6,
                borderWidth: 2,
                borderColor: isDark ? "#000000" : "#ffffff",
              }}
            />
          )}
        </View>

        <View className="flex-1">
          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="font-semibold text-base"
            numberOfLines={1}
          >
            {participant?.name || "Chat"}
          </Text>
          <Text
            style={{ color: isDark ? "#737373" : "#a1a1aa" }}
            className="text-xs"
          >
            {isTyping
              ? "typing..."
              : participant?.isOnline
                ? "online"
                : "offline"}
          </Text>
        </View>
      </View>
    </View>
  );
};
