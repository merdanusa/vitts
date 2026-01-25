import { getChatById, getCurrentUser, Message } from "@/services/api";
import { socketService } from "@/services/socket.service";
import { RootState } from "@/store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Mic, Paperclip, Send, Smile } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const ChatDetailScreen = () => {
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatData, setChatData] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const flatListRef = useRef<FlatList>(null);

  const loadChat = async () => {
    try {
      const [data, userData] = await Promise.all([
        getChatById(id),
        getCurrentUser(),
      ]);
      setChatData(data);
      setMessages(data.messages);
      setCurrentUserId(userData.id);
    } catch (error) {
      console.error("Failed to load chat:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChat();
    socketService.connect();

    const handleNewMessage = (data: any) => {
      if (data.chatId === id) {
        const newMessage: Message = {
          id: data.id,
          senderTitle: data.senderTitle,
          senderId: data.senderId,
          type: data.type,
          content: data.content,
          time: data.time,
          isRead: data.isRead,
        };
        setMessages((prev) => [...prev, newMessage]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    };

    socketService.on("newMessage", handleNewMessage);

    return () => {
      socketService.off("newMessage", handleNewMessage);
    };
  }, [id]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const messageContent = inputText.trim();
    setInputText("");

    socketService.sendMessage(id, messageContent, "text");
  };

  const formatTime = useCallback((timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isMyMessage = item.senderId === currentUserId;
      const showTime =
        index === messages.length - 1 ||
        new Date(messages[index + 1].time).getTime() -
          new Date(item.time).getTime() >
          300000;

      return (
        <View
          className={`px-4 mb-2 ${isMyMessage ? "items-end" : "items-start"}`}
        >
          <View
            style={{
              backgroundColor: isMyMessage
                ? "#007AFF"
                : isDark
                  ? "#262626"
                  : "#f3f4f6",
              maxWidth: "80%",
              borderRadius: 18,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                color: isMyMessage ? "#ffffff" : isDark ? "#ffffff" : "#000000",
                fontSize: 16,
                lineHeight: 20,
              }}
            >
              {item.content}
            </Text>
          </View>
          {showTime && (
            <Text
              style={{
                color: isDark ? "#737373" : "#a1a1aa",
                fontSize: 11,
                marginTop: 4,
              }}
            >
              {formatTime(item.time)}
            </Text>
          )}
        </View>
      );
    },
    [currentUserId, messages, isDark, formatTime],
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const participant = chatData?.participants?.find(
    (p: any) => p.id !== currentUserId,
  );

  if (loading) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="small"
            color={isDark ? "#ffffff" : "#000000"}
          />
        </View>
      </SafeAreaView>
    );
  }

  const hasAvatar =
    participant?.avatar &&
    participant.avatar !== "M" &&
    participant.avatar !== "";
  const initials = participant ? getInitials(participant.name) : "";

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View
          style={{
            borderBottomWidth: 0.5,
            borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
            backgroundColor: isDark ? "#000000" : "#ffffff",
          }}
          className="px-4 py-3"
        >
          <View className="flex-row items-center">
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => router.back()}
              className="mr-3"
            >
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
                {participant?.isOnline ? "online" : "offline"}
              </Text>
            </View>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={keyExtractor}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: 12 }}
          inverted={false}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={15}
          updateCellsBatchingPeriod={50}
          windowSize={15}
        />

        <View
          style={{
            borderTopWidth: 0.5,
            borderTopColor: isDark ? "#1a1a1a" : "#f3f4f6",
            backgroundColor: isDark ? "#000000" : "#ffffff",
          }}
          className="px-4 py-2"
        >
          <View className="flex-row items-center">
            <TouchableOpacity activeOpacity={0.6} className="mr-3">
              <Paperclip size={24} color={isDark ? "#ffffff" : "#007AFF"} />
            </TouchableOpacity>

            <View
              style={{
                backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
                borderWidth: 0.5,
                borderColor: isDark ? "#262626" : "#e5e7eb",
                flex: 1,
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: Platform.OS === "ios" ? 8 : 6,
                marginRight: 8,
              }}
              className="flex-row items-center"
            >
              <TextInput
                style={{
                  color: isDark ? "#ffffff" : "#000000",
                  flex: 1,
                  fontSize: 16,
                  maxHeight: 100,
                }}
                placeholder="Message"
                placeholderTextColor={isDark ? "#737373" : "#a1a1aa"}
                value={inputText}
                onChangeText={setInputText}
                multiline
                autoCapitalize="sentences"
                autoCorrect={true}
                returnKeyType="default"
              />
              <TouchableOpacity activeOpacity={0.6} className="ml-2">
                <Smile size={22} color={isDark ? "#737373" : "#a1a1aa"} />
              </TouchableOpacity>
            </View>

            {inputText.trim() ? (
              <TouchableOpacity activeOpacity={0.6} onPress={handleSend}>
                <Send size={24} color="#007AFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity activeOpacity={0.6}>
                <Mic size={24} color={isDark ? "#ffffff" : "#007AFF"} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default React.memo(ChatDetailScreen);
