import { getChatById, getCurrentUser, Message } from "@/services/api";
import { useState } from "react";
import { Alert } from "react-native";

export const useChatData = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatData, setChatData] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadChat = async () => {
    try {
      const [data, userData] = await Promise.all([
        getChatById(chatId),
        getCurrentUser(),
      ]);
      setChatData(data);
      setMessages(data.messages);
      setCurrentUserId(userData.id);
    } catch (error) {
      console.error("Failed to load chat:", error);
      Alert.alert("Error", "Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    chatData,
    currentUserId,
    loading,
    setMessages,
    setChatData,
    loadChat,
  };
};
