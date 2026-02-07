import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";

import { Message, sendVoiceMessage } from "@/services/api";
import { socketService } from "@/services/socket";
import { RootState } from "@/store";
import { useChatDataRedux } from "@/hooks/chat/useChatDataRedux";
import { useRecording } from "@/hooks/chat/useRecording";
import { useTypingIndicator } from "@/hooks/chat/useTypingIndicator";
import { sendDocument, sendImage } from "@/utils/messageUpload";

export const useChatScreen = (chatId: string) => {
  const isDark = useSelector((state: RootState) => state.theme.isDark);

  const [isMounted, setIsMounted] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    chatData,
    currentUserId,
    loading,
    loadingMore,
    hasMore,
    loadChat,
    loadMoreMessages,
    addNewMessage,
  } = useChatDataRedux(chatId);

  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    recordingAnimation,
  } = useRecording();

  const { isTyping, handleTyping, handleStopTyping } = useTypingIndicator();

  // Compatibility wrapper for upload utilities that expect setState pattern.
  // Redux handles the actual message updates via socket, so this is a no-op.
  const setMessagesCompat = useCallback(
    (updater: any) => {
      if (typeof updater === "function") {
        return;
      }
    },
    [addNewMessage],
  );

  // Set mounted after component mounts to ensure navigation context is ready
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          100,
        );
      },
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Socket listeners and chat loading
  useEffect(() => {
    if (!isMounted) return;

    loadChat();
    socketService.connect();

    const handleNewMessage = (data: any) => {
      if (data.chatId !== chatId) return;

      const incoming: Message = {
        id: data.id,
        senderTitle: data.senderTitle,
        senderId: data.senderId,
        type: data.type,
        content: data.content || data.mediaUrl || "",
        mediaUrl: data.mediaUrl,
        fileName: data.fileName,
        mimeType: data.mimeType,
        duration: data.duration,
        time: data.time,
        isRead: data.isRead ?? false,
      };

      addNewMessage(incoming);

      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        80,
      );
    };

    const handleTypingEvent = (data: any) =>
      handleTyping(data, chatId, currentUserId);
    const handleStopTypingEvent = (data: any) =>
      handleStopTyping(data, chatId);

    socketService.on("newMessage", handleNewMessage);
    socketService.on("userTyping", handleTypingEvent);
    socketService.on("userStopTyping", handleStopTypingEvent);

    return () => {
      socketService.off("newMessage", handleNewMessage);
      socketService.off("userTyping", handleTypingEvent);
      socketService.off("userStopTyping", handleStopTypingEvent);
    };
  }, [chatId, currentUserId, isMounted]);

  const bgImage = isDark
    ? require("@/assets/bg/default-dark.png")
    : require("@/assets/bg/default-light.png");

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    const messageContent = inputText.trim();
    setInputText("");
    setReplyingTo(null);
    socketService.sendMessage({
      chatId,
      content: messageContent,
      type: "text",
      replyTo: replyingTo?.id,
    });
  }, [chatId, inputText, replyingTo]);

  const handleEmojiSelect = useCallback(
    (emoji: string) => setInputText((prev) => prev + emoji),
    [],
  );

  const handleInputChange = useCallback(
    (text: string) => {
      setInputText(text);
      const participant = chatData?.participants?.find(
        (p: any) => p.id !== currentUserId,
      );
      if (text.trim() && participant?.id)
        socketService.typing(chatId, participant.id);
      else if (participant?.id) socketService.stopTyping(chatId, participant.id);
    },
    [chatId, chatData, currentUserId],
  );

  const handleImagePick = useCallback(async () => {
    setShowAttachMenu(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      for (const asset of result.assets) {
        await sendImage(
          asset.uri,
          chatId,
          setMessagesCompat,
          setUploading,
          flatListRef,
        );
      }
    }
  }, [chatId, setMessagesCompat]);

  const handleCameraPick = useCallback(async () => {
    setShowAttachMenu(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera access is needed to take photos",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      await sendImage(
        result.assets[0].uri,
        chatId,
        setMessagesCompat,
        setUploading,
        flatListRef,
      );
    }
  }, [chatId, setMessagesCompat]);

  const handleDocumentPick = useCallback(async () => {
    setShowAttachMenu(false);
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (!result.canceled && result.assets[0]) {
      for (const asset of result.assets) {
        await sendDocument(
          asset.uri,
          asset.name,
          asset.mimeType || "application/octet-stream",
          chatId,
          setMessagesCompat,
          setUploading,
          flatListRef,
        );
      }
    }
  }, [chatId, setMessagesCompat]);

  const handleStopRecording = useCallback(async () => {
    try {
      const result = await stopRecording();

      if (result && result.uri) {
        console.log("[Chat] Recording stopped, sending voice message...");
        await sendVoiceMessage(
          result.uri,
          result.duration,
          chatId,
          setMessagesCompat,
          setUploading,
          flatListRef,
        );
      } else {
        console.warn("[Chat] Recording stopped but no URI returned");
        Alert.alert("Error", "Failed to record voice message");
      }
    } catch (error) {
      console.error("[Chat] Error sending voice message:", error);
      Alert.alert("Error", "Failed to send voice message. Please try again.");
    }
  }, [chatId, stopRecording, setMessagesCompat]);

  const handleCancelRecording = useCallback(async () => {
    await cancelRecording();
  }, [cancelRecording]);

  const handleMessageLongPress = useCallback(
    (message: Message) => setReplyingTo(message),
    [],
  );

  const openEmojiPicker = useCallback(() => {
    Keyboard.dismiss();
    setTimeout(() => setShowEmojiPicker(true), 100);
  }, []);

  const closeEmojiPicker = useCallback(() => {
    setShowEmojiPicker(false);
  }, []);

  const openAttachMenu = useCallback(() => {
    Keyboard.dismiss();
    setTimeout(() => setShowAttachMenu(true), 100);
  }, []);

  const closeAttachMenu = useCallback(() => {
    setShowAttachMenu(false);
  }, []);

  const clearReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  return {
    // Theme
    isDark,
    bgImage,

    // State
    isMounted,
    inputText,
    showEmojiPicker,
    showAttachMenu,
    uploading,
    keyboardVisible,
    replyingTo,
    isRecording,
    recordingDuration,
    recordingAnimation,
    isTyping,
    loading,
    loadingMore,
    hasMore,

    // Data
    messages,
    chatData,
    currentUserId,
    flatListRef,

    // Handlers
    handleSend,
    handleEmojiSelect,
    handleInputChange,
    handleImagePick,
    handleCameraPick,
    handleDocumentPick,
    handleStopRecording,
    handleCancelRecording,
    handleMessageLongPress,
    startRecording,
    loadMoreMessages,
    openEmojiPicker,
    closeEmojiPicker,
    openAttachMenu,
    closeAttachMenu,
    clearReply,
    setInputText,
  };
};
