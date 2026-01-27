import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";

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

import { ImageBackground } from "@/components/ui/image-background";
import { useChatData } from "@/hooks/chat/useChatData";
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
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { messages, chatData, currentUserId, loading, setMessages, loadChat } =
    useChatData(id);
  const { isRecording, startRecording, stopRecording, recordingAnimation } =
    useRecording();
  const { isTyping, handleTyping, handleStopTyping } = useTypingIndicator();

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    loadChat();
    socketService.connect();

    const handleNewMessage = (data: any) => {
      if (data.chatId !== id) return;

      setMessages((prev) => {
        // Prevent adding the same message twice (by real ID)
        if (prev.some((msg) => msg.id === data.id)) {
          console.log(
            `[DUPLICATE PREVENTED] Message ${data.id} already exists`,
          );
          return prev;
        }

        const filtered = prev.filter((msg) => {
          if (msg.id.startsWith("temp-") || msg.id.startsWith("optimistic-")) {
            const timeDiff = Math.abs(
              new Date(msg.time).getTime() - new Date(data.time).getTime(),
            );
            return !(
              msg.content === (data.content || data.mediaUrl || "") &&
              timeDiff < 15000 // 15 seconds tolerance
            );
          }
          return true;
        });

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

        return [...filtered, incoming];
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 80);
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

  const bgImage = isDark
    ? require("@/assets/bg/default-dark.png")
    : require("@/assets/bg/default-light.png");

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

  const handleVoiceCall = () => {
    Alert.alert("Voice Call", "Voice calling feature coming soon!");
  };

  const handleVideoCall = () => {
    Alert.alert("Video Call", "Video calling feature coming soon!");
  };

  const handleMoreOptions = () => {
    Alert.alert("More Options", "Additional options coming soon!");
  };

  const handleProfilePress = () => {
    if (participant?.id) {
      router.push(`/discover/${participant.id}`);
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
      <ImageBackground source={bgImage} className="flex-1" resizeMode="cover">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          className="flex-1"
        >
          <View className="flex-1 relative">
            <View className="flex-1">
              <MessagesList
                ref={flatListRef}
                messages={messages}
                currentUserId={currentUserId}
                isDark={isDark}
                contentContainerStyle={{
                  paddingTop: 100,
                  paddingBottom: 16,
                }}
              />
            </View>

            <View className="absolute top-0 left-0 right-0 h-28 pointer-events-none z-[5]">
              <View
                className={`absolute inset-0 ${
                  isDark
                    ? "bg-gradient-to-b from-transparent via-black/40 to-black/90"
                    : "bg-gradient-to-b from-transparent via-white/40 to-white/90"
                }`}
              />
            </View>

            {/* Header - Positioned Absolutely on Top */}
            <View className="absolute top-0 left-0 right-0 z-10">
              <ChatHeader
                isDark={isDark}
                participant={participant}
                isTyping={isTyping}
                initialIsOnline={participant?.isOnline}
                onBack={() => router.back()}
                onProfilePress={handleProfilePress}
                onVoiceCall={handleVoiceCall}
                onVideoCall={handleVideoCall}
                onMoreOptions={handleMoreOptions}
              />
            </View>

            {/* Upload Indicator */}
            {uploading && <UploadIndicator isDark={isDark} />}

            {/* Recording Indicator */}
            {isRecording && (
              <RecordingIndicator
                isDark={isDark}
                recordingAnimation={recordingAnimation}
                onStop={stopRecording}
              />
            )}

            {/* Chat Input */}
            <ChatInput
              isDark={isDark}
              keyboardVisible={keyboardVisible}
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
          </View>

          {/* Emoji Picker Modal */}
          <EmojiPickerModal
            visible={showEmojiPicker}
            isDark={isDark}
            onClose={() => setShowEmojiPicker(false)}
            onSelect={handleEmojiSelect}
          />

          {/* Attachment Modal */}
          <AttachmentModal
            visible={showAttachMenu}
            isDark={isDark}
            onClose={() => setShowAttachMenu(false)}
            onImagePick={handleImagePick}
            onCameraPick={handleCameraPick}
            onDocumentPick={handleDocumentPick}
          />
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default React.memo(ChatDetailScreen);
