import { ChatListItem as ChatListItemType } from "@/services/api";
import { useRouter } from "expo-router";
import { CheckCheck } from "lucide-react-native";
import React, { useCallback } from "react";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";

interface ChatListItemProps {
  item: ChatListItemType;
  index: number;
  totalCount: number;
  currentUserId: string;
  isDark: boolean;
  formatTime: (timeString: string) => string;
  getMessagePreview: (chat: ChatListItemType, currentUserId: string) => string;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getMessageStatus = (
  chat: ChatListItemType,
  currentUserId: string,
  isDark: boolean,
) => {
  if (!chat.lastMessage || chat.lastMessage.senderId !== currentUserId) {
    return null;
  }

  const status = chat.lastMessage.isRead ? "read" : "delivered";

  if (status === "read") {
    return <CheckCheck size={14} color="#007AFF" />;
  } else {
    return <CheckCheck size={14} color={isDark ? "#8e8e8e" : "#a1a1aa"} />;
  }
};

const isUnread = (chat: ChatListItemType, currentUserId: string) => {
  if (!chat.lastMessage) return false;
  return (
    chat.lastMessage.senderId !== currentUserId && !chat.lastMessage.isRead
  );
};

export const ChatListItem = React.memo<ChatListItemProps>(
  ({
    item,
    index,
    totalCount,
    currentUserId,
    isDark,
    formatTime,
    getMessagePreview,
  }) => {
    const router = useRouter();

    const handleChatPress = useCallback(() => {
      router.push(`/chats/${item.id}`);
    }, [router, item.id]);

    const handleProfilePress = useCallback(() => {
      router.push(`/discover/${item.participant.id}`);
    }, [router, item.participant.id]);

    const unread = isUnread(item, currentUserId);
    const messageStatus = getMessageStatus(item, currentUserId, isDark);
    const initials = getInitials(item.participant.name);
    const hasAvatar =
      item.participant.avatar &&
      item.participant.avatar !== "M" &&
      item.participant.avatar !== "";

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleChatPress}
        style={{
          backgroundColor: isDark ? "#000000" : "#ffffff",
          borderBottomWidth: index < totalCount - 1 ? 0.5 : 0,
          borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
        }}
        className="px-4 py-3"
      >
        <View className="flex-row items-center">
          <Pressable onPress={handleProfilePress}>
            <View className="mr-3 relative">
              {hasAvatar ? (
                <Image
                  source={{ uri: item.participant.avatar }}
                  style={{ width: 56, height: 56, borderRadius: 28 }}
                />
              ) : (
                <View
                  style={{
                    backgroundColor: isDark ? "#262626" : "#f3f4f6",
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                  }}
                  className="items-center justify-center"
                >
                  <Text
                    style={{ color: isDark ? "#a1a1aa" : "#737373" }}
                    className="text-xl font-medium"
                  >
                    {initials}
                  </Text>
                </View>
              )}
              {item.participant.isOnline && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 14,
                    height: 14,
                    backgroundColor: "#22c55e",
                    borderRadius: 7,
                    borderWidth: 2,
                    borderColor: isDark ? "#000000" : "#ffffff",
                  }}
                />
              )}
            </View>
          </Pressable>

          <View className="flex-1">
            <View className="flex-row justify-between items-center mb-1">
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="font-semibold text-base"
                numberOfLines={1}
              >
                {item.participant.name}
              </Text>
              {item.lastMessage && (
                <Text
                  style={{ color: isDark ? "#737373" : "#a1a1aa" }}
                  className="text-xs ml-2"
                >
                  {formatTime(item.lastMessage.time)}
                </Text>
              )}
            </View>
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center flex-1 mr-2">
                {messageStatus && <View className="mr-1">{messageStatus}</View>}
                <Text
                  style={{
                    color: unread
                      ? isDark
                        ? "#ffffff"
                        : "#000000"
                      : isDark
                        ? "#737373"
                        : "#a1a1aa",
                  }}
                  className={`text-sm flex-1 ${unread ? "font-medium" : ""}`}
                  numberOfLines={1}
                >
                  {getMessagePreview(item, currentUserId)}
                </Text>
              </View>
              {unread && (
                <View
                  style={{ backgroundColor: "#007AFF" }}
                  className="w-2 h-2 rounded-full"
                />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.lastMessage?.id === nextProps.item.lastMessage?.id &&
      prevProps.item.lastMessage?.isRead ===
        nextProps.item.lastMessage?.isRead &&
      prevProps.item.participant.isOnline ===
        nextProps.item.participant.isOnline &&
      prevProps.isDark === nextProps.isDark &&
      prevProps.currentUserId === nextProps.currentUserId &&
      prevProps.index === nextProps.index
    );
  },
);

ChatListItem.displayName = "ChatListItem";
