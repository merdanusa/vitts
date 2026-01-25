import { getChatById, getCurrentUser, Message } from "@/services/api";
import { socketService } from "@/services/socket";
import { RootState } from "@/store";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Send,
  Smile,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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

const EMOJIS = ["❤️", "😂", "😮", "😢", "😡", "👍", "👎", "🔥", "🎉", "💯"];

const ChatDetailScreen = () => {
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatData, setChatData] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const recordingAnimation = useRef(new Animated.Value(1)).current;

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

    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      socketService.off("newMessage", handleNewMessage);
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [id]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimation, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      recordingAnimation.setValue(1);
    }
  }, [isRecording]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const messageContent = inputText.trim();
    setInputText("");

    socketService.sendMessage(id, messageContent, "text");
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleImagePick = async () => {
    setShowAttachMenu(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      console.log("Image selected:", result.assets[0].uri);
    }
  };

  const handleCameraPick = async () => {
    setShowAttachMenu(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      console.log("Photo taken:", result.assets[0].uri);
    }
  };

  const handleDocumentPick = async () => {
    setShowAttachMenu(false);
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
    });

    if (!result.canceled && result.assets[0]) {
      console.log("Document selected:", result.assets[0].name);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    console.log("Recording started");
  };

  const stopRecording = () => {
    setIsRecording(false);
    console.log("Recording stopped");
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
      edges={["top"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
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

        {isRecording && (
          <View
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#f3f4f6",
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Animated.View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#ef4444",
                    marginRight: 12,
                    transform: [{ scale: recordingAnimation }],
                  }}
                />
                <Text
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="text-base font-medium"
                >
                  Recording...
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={stopRecording}
                style={{
                  backgroundColor: isDark ? "#262626" : "#e5e7eb",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="font-medium"
                >
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View
          style={{
            borderTopWidth: 0.5,
            borderTopColor: isDark ? "#1a1a1a" : "#f3f4f6",
            backgroundColor: isDark ? "#000000" : "#ffffff",
            paddingBottom: Platform.OS === "ios" ? 0 : 8,
          }}
          className="px-4 py-2"
        >
          <View className="flex-row items-center">
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => setShowAttachMenu(true)}
              className="mr-3"
            >
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
              />
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => setShowEmojiPicker(true)}
                className="ml-2"
              >
                <Smile size={22} color={isDark ? "#737373" : "#a1a1aa"} />
              </TouchableOpacity>
            </View>

            {inputText.trim() ? (
              <TouchableOpacity activeOpacity={0.6} onPress={handleSend}>
                <Send size={24} color="#007AFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.6}
                onPressIn={startRecording}
                onPressOut={stopRecording}
              >
                <Mic size={24} color={isDark ? "#ffffff" : "#007AFF"} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showEmojiPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowEmojiPicker(false)}
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            style={{
              backgroundColor: isDark ? "#000000" : "#ffffff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: Platform.OS === "ios" ? 34 : 20,
            }}
          >
            <View className="flex-row items-center justify-between px-4 py-4">
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-lg font-semibold"
              >
                Emoji
              </Text>
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => setShowEmojiPicker(false)}
              >
                <X size={24} color={isDark ? "#ffffff" : "#000000"} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                paddingHorizontal: 16,
                paddingBottom: 16,
              }}
            >
              {EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  activeOpacity={0.6}
                  onPress={() => handleEmojiSelect(emoji)}
                  style={{
                    width: "20%",
                    aspectRatio: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 32 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showAttachMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttachMenu(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowAttachMenu(false)}
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            style={{
              backgroundColor: isDark ? "#000000" : "#ffffff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: Platform.OS === "ios" ? 34 : 20,
            }}
          >
            <View className="flex-row items-center justify-between px-4 py-4">
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-lg font-semibold"
              >
                Send Attachment
              </Text>
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => setShowAttachMenu(false)}
              >
                <X size={24} color={isDark ? "#ffffff" : "#000000"} />
              </TouchableOpacity>
            </View>
            <View className="px-4 pb-4">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleImagePick}
                style={{
                  backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                }}
                className="flex-row items-center"
              >
                <View
                  style={{
                    backgroundColor: "#007AFF",
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                  }}
                  className="items-center justify-center mr-3"
                >
                  <ImageIcon size={20} color="#ffffff" />
                </View>
                <Text
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="text-base font-medium"
                >
                  Photo from Gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleCameraPick}
                style={{
                  backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                }}
                className="flex-row items-center"
              >
                <View
                  style={{
                    backgroundColor: "#10b981",
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                  }}
                  className="items-center justify-center mr-3"
                >
                  <ImageIcon size={20} color="#ffffff" />
                </View>
                <Text
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="text-base font-medium"
                >
                  Take Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleDocumentPick}
                style={{
                  backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
                  borderRadius: 12,
                  padding: 16,
                }}
                className="flex-row items-center"
              >
                <View
                  style={{
                    backgroundColor: "#f59e0b",
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                  }}
                  className="items-center justify-center mr-3"
                >
                  <Paperclip size={20} color="#ffffff" />
                </View>
                <Text
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="text-base font-medium"
                >
                  Document
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default React.memo(ChatDetailScreen);
