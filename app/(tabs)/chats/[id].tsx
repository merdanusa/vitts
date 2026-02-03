import { BlurView } from "expo-blur";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { Message, sendVoiceMessage } from "@/services/api";
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
import { useChatDataRedux } from "@/hooks/chat/useChatDataRedux";
import { useRecording } from "@/hooks/chat/useRecording";
import { useTypingIndicator } from "@/hooks/chat/useTypingIndicator";
import { sendDocument, sendImage } from "@/utils/messageUpload";

const ReplyPreview: React.FC<{
  message: Message;
  isDark: boolean;
  onClose: () => void;
}> = ({ message, isDark, onClose }) => {
  const slideAnim = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      className={`mx-3 mb-2 rounded-lg overflow-hidden border-l-4 border-l-[#0088cc] ${isDark ? "bg-neutral-900" : "bg-white"}`}
      style={{ transform: [{ translateY: slideAnim }] }}
    >
      <View className="flex-row items-center py-2.5 px-3">
        <View className="flex-1">
          <Text className="text-[#0088cc] font-semibold text-[13px] mb-0.5">
            Replying to {message.senderTitle || "message"}
          </Text>
          <Text
            className={`text-sm ${isDark ? "text-neutral-500" : "text-neutral-600"}`}
            numberOfLines={1}
          >
            {message.type === "image"
              ? "📷 Photo"
              : message.type === "voice"
                ? "🎤 Voice message"
                : message.content}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={20} color={isDark ? "#666" : "#999"} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const ChatDetailScreen = () => {
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Add mounted state to prevent rendering before navigation is ready
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
  } = useChatDataRedux(id);
  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    recordingAnimation,
  } = useRecording();
  const { isTyping, handleTyping, handleStopTyping } = useTypingIndicator();

  // Compatibility wrapper for old setMessagesCompat callback pattern
  // The upload utilities expect setMessagesCompat(prev => [...prev, newMsg])
  // but we're using Redux now, so we convert to addNewMessage
  const setMessagesCompatCompat = useCallback(
    (updater: any) => {
      if (typeof updater === "function") {
        // For callback pattern, we ignore it since Redux handles the update
        // The message will be added via socket handler anyway
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

  useEffect(() => {
    if (!isMounted) return; // Don't load until mounted

    loadChat();
    socketService.connect();

    const handleNewMessage = (data: any) => {
      if (data.chatId !== id) return;

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

      // Add message to Redux store (it will handle duplicates)
      addNewMessage(incoming);

      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        80,
      );
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
  }, [id, currentUserId, isMounted]);

  const bgImage = isDark
    ? require("@/assets/bg/default-dark.png")
    : require("@/assets/bg/default-light.png");

  const handleSend = () => {
    if (!inputText.trim()) return;
    const messageContent = inputText.trim();
    setInputText("");
    setReplyingTo(null);
    socketService.sendMessage({
      chatId: id,
      content: messageContent,
      type: "text",
      replyTo: replyingTo?.id,
    });
  };

  const handleEmojiSelect = (emoji: string) =>
    setInputText((prev) => prev + emoji);

  const handleInputChange = (text: string) => {
    setInputText(text);
    const participant = chatData?.participants?.find(
      (p: any) => p.id !== currentUserId,
    );
    if (text.trim() && participant?.id)
      socketService.typing(id, participant.id);
    else if (participant?.id) socketService.stopTyping(id, participant.id);
  };

  const handleImagePick = async () => {
    setShowAttachMenu(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      for (const asset of result.assets) {
        await sendImage(asset.uri, id, setMessagesCompat, setUploading, flatListRef);
      }
    }
  };

  const handleCameraPick = async () => {
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
        id,
        setMessagesCompat,
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
      multiple: true,
    });

    if (!result.canceled && result.assets[0]) {
      for (const asset of result.assets) {
        await sendDocument(
          asset.uri,
          asset.name,
          asset.mimeType || "application/octet-stream",
          id,
          setMessagesCompat,
          setUploading,
          flatListRef,
        );
      }
    }
  };

  const handleStopRecording = async () => {
    try {
      const result = await stopRecording();

      if (result && result.uri) {
        console.log("[Chat] Recording stopped, sending voice message...");
        await sendVoiceMessage(
          result.uri,
          result.duration,
          id,
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
  };

  const handleCancelRecording = async () => {
    await cancelRecording();
  };

  const handleVoiceCall = () =>
    Alert.alert("Voice Call", "Starting voice call...");
  const handleVideoCall = () =>
    Alert.alert("Video Call", "Starting video call...");
  const handleMoreOptions = () =>
    Alert.alert("Options", "Additional options...");

  const handleProfilePress = () => {
    if (participant?.id) router.push(`/discover/${participant.id}`);
  };

  const handleMessageLongPress = (message: Message) => setReplyingTo(message);

  const participant = chatData?.participants?.find(
    (p: any) => p.id !== currentUserId,
  );

  // Show loading screen until both data is loaded AND component is mounted
  if (loading || !isMounted) return <LoadingView isDark={isDark} />;

  return (
    <View className={`flex-1 ${isDark ? "bg-[#0a0a0a]" : "bg-[#efeae2]"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <ImageBackground
        source={bgImage}
        className="flex-1"
        resizeMode="repeat"
        imageStyle={{ opacity: isDark ? 0.03 : 0.06 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
          className="flex-1"
        >
          <Animated.View className="absolute top-0 left-0 right-0 z-50">
            {Platform.OS === "ios" ? (
              <BlurView
                intensity={isDark ? 80 : 90}
                tint={isDark ? "dark" : "light"}
                className="overflow-hidden"
              >
                <SafeAreaView edges={["top"]}>
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
                </SafeAreaView>
              </BlurView>
            ) : (
              <View className={isDark ? "bg-[#121212]/97" : "bg-white/97"}>
                <SafeAreaView edges={["top"]}>
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
                </SafeAreaView>
              </View>
            )}
          </Animated.View>

          <View className="flex-1">
            <MessagesList
              ref={flatListRef}
              messages={messages}
              currentUserId={currentUserId}
              isDark={isDark}
              onLoadMore={loadMoreMessages}
              loadingMore={loadingMore}
              hasMore={hasMore}
            />
          </View>

          {uploading && <UploadIndicator isDark={isDark} />}

          {isRecording && (
            <RecordingIndicator
              isDark={isDark}
              recordingAnimation={recordingAnimation}
              recordingDuration={recordingDuration}
              onStop={handleStopRecording}
              onCancel={handleCancelRecording}
            />
          )}

          {replyingTo && (
            <ReplyPreview
              message={replyingTo}
              isDark={isDark}
              onClose={() => setReplyingTo(null)}
            />
          )}

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
            onStopRecording={handleStopRecording}
          />

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
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default React.memo(ChatDetailScreen);
