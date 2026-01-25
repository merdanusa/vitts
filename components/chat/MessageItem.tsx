import { Message } from "@/services/api";
import { File, Mic } from "lucide-react-native";
import React from "react";
import { Image, Text, View } from "react-native";
import { formatTime } from "../../../../utils/helpers";

interface MessageItemProps {
  message: Message;
  isMyMessage: boolean;
  showTime: boolean;
  isDark: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isMyMessage,
  showTime,
  isDark,
}) => {
  const renderContent = () => {
    switch (message.type) {
      case "image":
        return (
          <Image
            source={{ uri: message.content }}
            style={{ width: 200, height: 200, borderRadius: 18 }}
            resizeMode="cover"
          />
        );

      case "document":
        return (
          <View className="flex-row items-center py-2">
            <View
              style={{
                backgroundColor: isMyMessage
                  ? "#ffffff20"
                  : isDark
                    ? "#ffffff20"
                    : "#00000020",
                width: 32,
                height: 32,
                borderRadius: 16,
              }}
              className="items-center justify-center mr-2"
            >
              <File
                size={16}
                color={isMyMessage ? "#ffffff" : isDark ? "#ffffff" : "#000000"}
              />
            </View>
            <Text
              style={{
                color: isMyMessage ? "#ffffff" : isDark ? "#ffffff" : "#000000",
                fontSize: 14,
              }}
              numberOfLines={1}
            >
              {message.content}
            </Text>
          </View>
        );

      case "voice":
      case "audio":
        return (
          <View className="flex-row items-center py-2">
            <View
              style={{
                backgroundColor: isMyMessage
                  ? "#ffffff20"
                  : isDark
                    ? "#ffffff20"
                    : "#00000020",
                width: 32,
                height: 32,
                borderRadius: 16,
              }}
              className="items-center justify-center mr-2"
            >
              <Mic
                size={16}
                color={isMyMessage ? "#ffffff" : isDark ? "#ffffff" : "#000000"}
              />
            </View>
            <Text
              style={{
                color: isMyMessage ? "#ffffff" : isDark ? "#ffffff" : "#000000",
                fontSize: 14,
              }}
            >
              Voice message
            </Text>
          </View>
        );

      default:
        return (
          <Text
            style={{
              color: isMyMessage ? "#ffffff" : isDark ? "#ffffff" : "#000000",
              fontSize: 16,
              lineHeight: 20,
            }}
          >
            {message.content}
          </Text>
        );
    }
  };

  return (
    <View className={`px-4 mb-2 ${isMyMessage ? "items-end" : "items-start"}`}>
      <View
        style={{
          backgroundColor:
            message.type === "image"
              ? "transparent"
              : isMyMessage
                ? "#007AFF"
                : isDark
                  ? "#262626"
                  : "#f3f4f6",
          maxWidth: "80%",
          borderRadius: 18,
          paddingHorizontal: message.type === "image" ? 0 : 12,
          paddingVertical: message.type === "image" ? 0 : 8,
          overflow: "hidden",
        }}
      >
        {renderContent()}
      </View>
      {showTime && (
        <Text
          style={{
            color: isDark ? "#737373" : "#a1a1aa",
            fontSize: 11,
            marginTop: 4,
          }}
        >
          {formatTime(message.time)}
        </Text>
      )}
    </View>
  );
};
