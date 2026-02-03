import { Message } from "@/services/api";
import { formatTime } from "@/utils/helpers";
import { File } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Image, Pressable, Text, View } from "react-native";
import { VoiceMessagePlayer } from "@/components/VoiceMessagePlayer";

interface MessageItemProps {
  message: Message;
  isMyMessage: boolean;
  showTime: boolean;
  isDark: boolean;
  isGroupChat?: boolean;
  senderName?: string;
  onLongPress?: () => void;
}

// Utility function to generate consistent colors for user IDs
const getUserColor = (userId: string): string => {
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
  const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const isOnlyEmoji = (text: string): boolean => {
  if (!text || text.length > 10) return false;
  const emojiPattern = /^[\p{Emoji}\u200d]+$/u;
  const trimmed = text.trim();
  return emojiPattern.test(trimmed) && trimmed.length <= 4;
};

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isMyMessage,
  showTime,
  isDark,
  isGroupChat = false,
  senderName,
  onLongPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animationRef.current = Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 80,
      friction: 7,
      useNativeDriver: true,
    });
    animationRef.current.start();

    return () => {
      // Clean up animation on unmount
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 4,
            }}
          >
            <View
              style={{
                backgroundColor: isMyMessage
                  ? "rgba(255, 255, 255, 0.2)"
                  : isDark
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.1)",
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <File
                size={18}
                color={isMyMessage ? "#ffffff" : isDark ? "#ffffff" : "#000000"}
              />
            </View>
            <Text
              style={{
                color: isMyMessage ? "#ffffff" : isDark ? "#ffffff" : "#000000",
                fontSize: 14,
                flex: 1,
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
          <VoiceMessagePlayer
            duration={45} // You can pass actual duration from message data
            isMyMessage={isMyMessage}
            isDark={isDark}
            audioUrl={message.content}
          />
        );

      default:
        if (isOnlyEmoji(message.content)) {
          return (
            <View style={{ paddingVertical: 8 }}>
              <Text
                style={{ fontSize: 72, lineHeight: 84, textAlign: "center" }}
              >
                {message.content}
              </Text>
            </View>
          );
        }
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

  const isLargeEmoji = message.type === "text" && isOnlyEmoji(message.content);

  return (
    <Animated.View
      style={{
        paddingHorizontal: 16,
        marginBottom: 8,
        alignItems: isMyMessage ? "flex-end" : "flex-start",
        transform: [{ scale: scaleAnim }],
      }}
    >
      {/* Show sender name for non-own messages in group chats */}
      {isGroupChat && !isMyMessage && senderName && (
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: getUserColor(message.senderId),
            marginBottom: 4,
            marginLeft: 4,
          }}
        >
          {senderName}
        </Text>
      )}

      <Pressable
        onLongPress={onLongPress}
        delayLongPress={200}
        disabled={!onLongPress}
      >
        <View
          style={{
            backgroundColor:
              message.type === "image" || isLargeEmoji
                ? "transparent"
                : isMyMessage
                  ? "#007AFF"
                  : isDark
                    ? "#262626"
                    : "#f3f4f6",
            maxWidth: isLargeEmoji ? undefined : "80%",
            borderRadius: 18,
            paddingHorizontal: message.type === "image" || isLargeEmoji ? 0 : 12,
            paddingVertical: message.type === "image" || isLargeEmoji ? 0 : 8,
            overflow: "hidden",
          }}
        >
          {renderContent()}
        </View>
      </Pressable>

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
    </Animated.View>
  );
};
