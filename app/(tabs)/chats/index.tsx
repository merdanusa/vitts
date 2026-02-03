import { ChatListItem as ChatListItemComponent } from "@/components/chat/ChatListItem";
import { DebugUserInfo } from "@/components/screens/DebugUserInfo";
import { ChatListItem, getCurrentUser, getMyChats } from "@/services/api";
import { socketService } from "@/services/socket";
import { RootState } from "@/store";
import {
  selectChatList,
  selectLoadingChats,
  setChats,
  setLoadingChats,
} from "@/store/chatSlice";
import { useAppDispatch } from "@/store/hooks";
import { useRouter } from "expo-router";
import { Search, UserPlus } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  FlatList,
  Image,
  Platform,
  RefreshControl,
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

const ChatsScreen = () => {
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const chats = useSelector(selectChatList);
  const loading = useSelector(selectLoadingChats);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [showDebug, setShowDebug] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  const loadChats = async () => {
    try {
      dispatch(setLoadingChats(true));
      const [chatsData, userData] = await Promise.all([
        getMyChats(),
        getCurrentUser(),
      ]);
      dispatch(setChats(chatsData));
      setCurrentUserId(userData.id);
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      dispatch(setLoadingChats(false));
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadChats();

    // Listen to socket for chat updates instead of polling
    const handleChatUpdated = (data: any) => {
      console.log("[CHATS] Chat updated via socket:", data);
      loadChats();
    };

    socketService.on("chatUpdated", handleChatUpdated);

    // Fallback: Poll only when socket is disconnected (every 30 seconds)
    const checkSocketAndPoll = () => {
      if (!socketService.isConnected()) {
        console.log("[CHATS] Socket disconnected, polling as fallback");
        loadChats();
      }
    };

    intervalRef.current = setInterval(checkSocketAndPoll, 30000); // 30 seconds

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        loadChats();
      }
      appState.current = nextAppState;
    });

    return () => {
      socketService.off("chatUpdated", handleChatUpdated);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      subscription.remove();
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadChats();
  }, []);

  const filteredChats = chats.filter(
    (chat) =>
      chat.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.participant.login?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatTime = useCallback((timeString: string) => {
    const messageDate = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString("en-US", { weekday: "long" });
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  }, []);

  const getMessagePreview = useCallback(
    (chat: ChatListItem, currentUserId: string) => {
      if (!chat.lastMessage) return "Tap to start chatting";

      const { content, type, senderId } = chat.lastMessage;
      const isSentByMe = senderId === currentUserId;
      const prefix = isSentByMe ? "You: " : "";

      switch (type) {
        case "image":
          return `${prefix}📷 Photo`;
        case "video":
          return `${prefix}🎥 Video`;
        case "voice":
        case "audio":
          return `${prefix}🎤 Voice message`;
        case "document":
          return `${prefix}📄 Document`;
        case "location":
          return `${prefix}📍 Location`;
        case "contact":
          return `${prefix}👤 Contact`;
        case "poll":
          return `${prefix}📊 Poll`;
        case "sticker":
          return `${prefix}Sticker`;
        case "deleted":
          return `${prefix}This message was deleted`;
        case "system":
          return content || "System message";
        default:
          return `${prefix}${content}`;
      }
    },
    [],
  );

  const handleContactsPress = useCallback(() => {
    router.push("/contacts");
  }, [router]);

  const renderChatItem = useCallback(
    ({ item, index }: { item: ChatListItem; index: number }) => {
      return (
        <ChatListItemComponent
          item={item}
          index={index}
          totalCount={filteredChats.length}
          currentUserId={currentUserId}
          isDark={isDark}
          formatTime={formatTime}
          getMessagePreview={getMessagePreview}
        />
      );
    },
    [
      currentUserId,
      isDark,
      filteredChats.length,
      formatTime,
      getMessagePreview,
    ],
  );

  const keyExtractor = useCallback((item: ChatListItem) => item.id, []);

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

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      <View className="flex-1">
        {__DEV__ && (
          <TouchableOpacity
            onPress={() => setShowDebug(!showDebug)}
            style={{
              padding: 16,
              backgroundColor: showDebug ? "#ef4444" : "#22c55e",
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {showDebug ? "Hide Debug" : "Show Debug Info"}
            </Text>
          </TouchableOpacity>
        )}

        {showDebug && <DebugUserInfo />}

        <View
          style={{
            borderBottomWidth: 0.5,
            borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
          }}
          className="px-4 pt-2 pb-3"
        >
          <View className="flex-row gap-2 items-center mb-3">
            <Image
              source={require("@/assets/images/app_icon.png")}
              className="w-10 h-10"
              alt="logo"
            />
            <Text
              style={{ color: isDark ? "#ffffff" : "#000000" }}
              className="text-3xl font-bold"
            >
              Vitts
            </Text>
          </View>

          <View className="relative">
            <View className="absolute left-3 top-2.5 z-10">
              <Search size={16} color={isDark ? "#737373" : "#a1a1aa"} />
            </View>
            <TextInput
              style={{
                backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
                color: isDark ? "#ffffff" : "#000000",
                borderWidth: 0.5,
                borderColor: isDark ? "#262626" : "#e5e7eb",
                ...(Platform.OS === "ios" ? { height: 36 } : {}),
              }}
              className="rounded-lg pl-10 pr-4 py-2 text-base"
              placeholder="Search"
              placeholderTextColor={isDark ? "#737373" : "#a1a1aa"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
        </View>

        {filteredChats.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text
              style={{ color: isDark ? "#737373" : "#a1a1aa" }}
              className="text-base text-center"
            >
              {searchQuery ? "No chats found" : "No messages"}
            </Text>
            {!searchQuery && (
              <Text
                style={{ color: isDark ? "#525252" : "#d4d4d8" }}
                className="text-sm text-center mt-2"
              >
                Start a new conversation
              </Text>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            keyExtractor={keyExtractor}
            renderItem={renderChatItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDark ? "#ffffff" : "#000000"}
              />
            }
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={10}
          />
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleContactsPress}
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#007AFF",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
          className="items-center justify-center"
        >
          <UserPlus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default React.memo(ChatsScreen);
