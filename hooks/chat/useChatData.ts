import { getChatById, getCurrentUser, Message } from "@/services/api";
import { useState } from "react";
import { Alert } from "react-native";

export const useChatData = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatData, setChatData] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadChat = async () => {
    try {
      const [data, userData] = await Promise.all([
        getChatById(chatId, { limit: 50 }),
        getCurrentUser(),
      ]);
      setChatData(data);
      setMessages(data.messages);
      setCurrentUserId(userData.id);
      setHasMore(data.hasMore ?? false);
    } catch (error) {
      console.error("Failed to load chat:", error);
      Alert.alert("Error", "Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore || messages.length === 0) return;

    setLoadingMore(true);
    try {
      const oldestMessage = messages[0];
      const data = await getChatById(chatId, {
        limit: 30,
        before: oldestMessage.id,
      });

      // Prepend older messages
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMore(data.hasMore ?? false);
    } catch (error) {
      console.error("Failed to load more messages:", error);
      Alert.alert("Error", "Failed to load more messages");
    } finally {
      setLoadingMore(false);
    }
  };

  return {
    messages,
    chatData,
    currentUserId,
    loading,
    loadingMore,
    hasMore,
    setMessages,
    setChatData,
    loadChat,
    loadMoreMessages,
  };
};
