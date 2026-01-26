import { ENV } from "@/configs/env.config";
import { Message } from "@/services/api";
import * as SecureStore from "expo-secure-store";

import { Alert } from "react-native";

const API_BASE_URL =
  ENV.EXPO_PUBLIC_API_URL || "https://vittsbackend-production.up.railway.app";

const ensureChatExists = async (chatId: string): Promise<boolean> => {
  try {
    const token = await SecureStore.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Chat validation failed:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating chat:", error);
    return false;
  }
};

export const sendImage = async (
  uri: string,
  chatId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setUploading: React.Dispatch<React.SetStateAction<boolean>>,
  flatListRef: any,
) => {
  try {
    setUploading(true);

    const chatExists = await ensureChatExists(chatId);
    if (!chatExists) {
      throw new Error(
        "You are not part of this chat. Please refresh and try again.",
      );
    }

    const filename = uri.split("/").pop() || `image-${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    const formData = new FormData();
    formData.append("file", { uri, name: filename, type } as any);
    formData.append("type", "image");

    const token = await SecureStore.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/api/chats/${chatId}/message`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload image");
    }

    const result = await response.json();
    const newMessage: Message = {
      id: result.id,
      senderTitle: result.senderTitle,
      senderId: result.senderId,
      type: result.type,
      content: result.content || result.mediaUrl,
      time: result.time,
      isRead: result.isRead,
    };

    setMessages((prev) => [...prev, newMessage]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  } catch (error: any) {
    console.error("Error uploading image:", error);
    Alert.alert("Upload Failed", error.message || "Failed to upload image");
  } finally {
    setUploading(false);
  }
};

export const sendDocument = async (
  uri: string,
  fileName: string,
  mimeType: string,
  chatId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setUploading: React.Dispatch<React.SetStateAction<boolean>>,
  flatListRef: any,
) => {
  try {
    setUploading(true);

    const chatExists = await ensureChatExists(chatId);
    if (!chatExists) {
      throw new Error(
        "You are not part of this chat. Please refresh and try again.",
      );
    }

    const formData = new FormData();
    formData.append("file", { uri, name: fileName, type: mimeType } as any);
    formData.append("type", "document");

    const token = await SecureStore.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/api/chats/${chatId}/message`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload document");
    }

    const result = await response.json();
    const newMessage: Message = {
      id: result.id,
      senderTitle: result.senderTitle,
      senderId: result.senderId,
      type: result.type,
      content: result.fileName || fileName,
      time: result.time,
      isRead: result.isRead,
    };

    setMessages((prev) => [...prev, newMessage]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  } catch (error: any) {
    console.error("Error uploading document:", error);
    Alert.alert("Upload Failed", error.message || "Failed to upload document");
  } finally {
    setUploading(false);
  }
};
