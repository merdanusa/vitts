import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { Message } from "@/services/api";
import { socketService } from "@/services/socket";
import { RootState } from "@/store";

import { AttachmentModal } from "@/components/chat/AttachmentModal";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { EmojiPickerModal } from "@/components/chat/EmojiPickerModal";
import { LoadingView } from "@/components/chat/LoadingView";
import { MessagesList } from "@/components/chat/MessagesList";
import { RecordingIndicator } from "@/components/chat/RecordingIndicator";
import { UploadIndicator } from "@/components/chat/UploadIndicator";

import { useChatData } from "@/hooks/chat/useChatData";
import { useKeyboard } from "@/hooks/chat/useKeyboard";
import { useRecording } from "@/hooks/chat/useRecording";
import { useTypingIndicator } from "@/hooks/chat/useTypingIndicator";
import { sendDocument, sendImage } from "@/utils/messageUpload";

const ChatDetailScreen = () => {
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // State
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Refs
  const flatListRef = useRef<FlatList>(null);

  // Custom hooks
  const { messages, chatData, currentUserId, loading, setMessages, loadChat } =
    useChatData(id);
  const { keyboardHeight } = useKeyboard();
  const { isRecording, startRecording, stopRecording, recordingAnimation } =
    useRecording();
  const { isTyping, handleTyping, handleStopTyping } = useTypingIndicator();

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
          content: data.content || data.mediaUrl,
          time: data.time,
          isRead: data.isRead,
        };
        setMessages((prev) => [...prev, newMessage]);
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          100,
        );
      }
    };

    socketService.on("newMessage", handleNewMessage);
    socketService.on("userTyping", (data: any) =>
      handleTyping(data, id, currentUserId),
    );
    socketService.on("userStopTyping", (data: any) =>
      handleStopTyping(data, id),
    );

    return () => {
      socketService.off("newMessage", handleNewMessage);
      socketService.off("userTyping");
      socketService.off("userStopTyping");
    };
  }, [id, currentUserId]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const messageContent = inputText.trim();
    setInputText("");
    socketService.sendMessage({
      chatId: id,
      content: messageContent,
      type: "text",
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    const participant = chatData?.participants?.find(
      (p: any) => p.id !== currentUserId,
    );
    if (text.trim() && participant?.id) {
      socketService.typing(id, participant.id);
    } else if (participant?.id) {
      socketService.stopTyping(id, participant.id);
    }
  };

  const handleImagePick = async () => {
    setShowAttachMenu(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await sendImage(
        result.assets[0].uri,
        id,
        setMessages,
        setUploading,
        flatListRef,
      );
    }
  };

  const handleCameraPick = async () => {
    setShowAttachMenu(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Camera permission is required to take photos",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await sendImage(
        result.assets[0].uri,
        id,
        setMessages,
        setUploading,
        flatListRef,
      );
    }
  };

  const handleDocumentPick = async () => {
    setShowAttachMenu(false);
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await sendDocument(
        asset.uri,
        asset.name,
        asset.mimeType || "application/octet-stream",
        id,
        setMessages,
        setUploading,
        flatListRef,
      );
    }
  };

  const participant = chatData?.participants?.find(
    (p: any) => p.id !== currentUserId,
  );

  if (loading) {
    return <LoadingView isDark={isDark} />;
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
      edges={["top"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ChatHeader
          isDark={isDark}
          participant={participant}
          isTyping={isTyping}
          onBack={() => router.back()}
        />

        <MessagesList
          ref={flatListRef}
          messages={messages}
          currentUserId={currentUserId}
          isDark={isDark}
        />

        {uploading && <UploadIndicator isDark={isDark} />}

        {isRecording && (
          <RecordingIndicator
            isDark={isDark}
            recordingAnimation={recordingAnimation}
            onStop={stopRecording}
          />
        )}

        <ChatInput
          isDark={isDark}
          inputText={inputText}
          uploading={uploading}
          isRecording={isRecording}
          onChangeText={handleInputChange}
          onSend={handleSend}
          onAttach={() => setShowAttachMenu(true)}
          onEmoji={() => setShowEmojiPicker(true)}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
        />
      </KeyboardAvoidingView>

      <EmojiPickerModal
        visible={showEmojiPicker}
        isDark={isDark}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={handleEmojiSelect}
      />

      <AttachmentModal
        visible={showAttachMenu}
        isDark={isDark}
        onClose={() => setShowAttachMenu(false)}
        onImagePick={handleImagePick}
        onCameraPick={handleCameraPick}
        onDocumentPick={handleDocumentPick}
      />
    </SafeAreaView>
  );
};

export default React.memo(ChatDetailScreen);
