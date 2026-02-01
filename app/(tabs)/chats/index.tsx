import { DebugUserInfo } from "@/components/screens/DebugUserInfo";
import { GroupListItem } from "@/components/groups/GroupListItem";
import { ChatListItem, getCurrentUser, getMyChats } from "@/services/api";
import { RootState } from "@/store";
import { useRouter } from "expo-router";
import { CheckCheck, Search, UserPlus } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";

// --- FIX 1: Single, Safe Helper Function (Moved outside component) ---
const getInitials = (name?: string | null): string => {
  // Safety check: if name is missing or empty, return fallback
  if (!name || name.trim().length === 0) {
    return "?";
  }

  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const ChatsScreen = () => {
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const groups = useSelector((state: RootState) => state.groups.groups);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [showDebug, setShowDebug] = useState(false);
  const [activeTab, setActiveTab] = useState<"chats" | "groups">("chats");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  const loadChats = async () => {
    try {
      const [chatsData, userData] = await Promise.all([
        getMyChats(),
        getCurrentUser(),
      ]);
      setChats(chatsData);
      setCurrentUserId(userData.id);
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadChats();

    intervalRef.current = setInterval(() => {
      loadChats();
    }, 5000);

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

  // --- FIX 2: Removed duplicate getInitials function from here ---

  const filteredChats = chats.filter((chat) => {
    const query = searchQuery.toLowerCase();
    const name = chat.participant?.name?.toLowerCase() ?? "";
    const login = chat.participant?.login?.toLowerCase() ?? "";
    return name.includes(query) || login.includes(query);
  });

  const filteredGroups = groups.filter((group) => {
    const query = searchQuery.toLowerCase();
    const name = group.name?.toLowerCase() ?? "";
    const description = group.description?.toLowerCase() ?? "";
    return name.includes(query) || description.includes(query);
  });

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

  const getMessageStatus = useCallback(
    (chat: ChatListItem, currentUserId: string, isDark: boolean) => {
      if (!chat.lastMessage || chat.lastMessage.senderId !== currentUserId) {
        return null;
      }

      const status = chat.lastMessage.isRead ? "read" : "delivered";

      if (status === "read") {
        return <CheckCheck size={14} color="#007AFF" />;
      } else {
        return <CheckCheck size={14} color={isDark ? "#8e8e8e" : "#a1a1aa"} />;
      }
    },
    [],
  );

  const isUnread = useCallback((chat: ChatListItem, currentUserId: string) => {
    if (!chat.lastMessage) return false;
    return (
      chat.lastMessage.senderId !== currentUserId && !chat.lastMessage.isRead
    );
  }, []);

  const handleChatPress = useCallback(
    (chatId: string) => {
      router.push(`/chats/${chatId}`);
    },
    [router],
  );

  const handleNewChat = useCallback(() => {
    router.push("/discover");
  }, [router]);

  const handleContactsPress = useCallback(() => {
    router.push("/contacts");
  }, [router]);

  const renderChatItem = useCallback(
    ({ item, index }: { item: ChatListItem; index: number }) => {
      const unread = isUnread(item, currentUserId);
      const messageStatus = getMessageStatus(item, currentUserId, isDark);

      // --- FIX 3: Safely calculate Display Name and Initials ---
      // If name is missing, use login. If login is missing, use "Unknown"
      const displayName =
        item.participant?.name || item.participant?.login || "Unknown";
      const initials = getInitials(displayName);

      const hasAvatar =
        item.participant.avatar &&
        item.participant.avatar !== "M" &&
        item.participant.avatar !== "";

      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleChatPress(item.id)}
          style={{
            backgroundColor: isDark ? "#000000" : "#ffffff",
            borderBottomWidth: index < filteredChats.length - 1 ? 0.5 : 0,
            borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
          }}
          className="px-4 py-3"
        >
          <View className="flex-row items-center">
            <Pressable
              onPress={() => {
                router.push(`/discover/${item.participant.id}`);
              }}
            >
              <View className="mr-3 relative">
                {hasAvatar ? (
                  <Image
                    source={{ uri: item.participant.avatar }}
                    style={{ width: 56, height: 56, borderRadius: 28 }}
                  />
                ) : (
                  <View
                    style={{
                      backgroundColor: isDark ? "#262626" : "#f3f4f6",
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                    }}
                    className="items-center justify-center"
                  >
                    <Text
                      style={{ color: isDark ? "#a1a1aa" : "#737373" }}
                      className="text-xl font-medium"
                    >
                      {initials}
                    </Text>
                  </View>
                )}
                {item.participant.isOnline && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 14,
                      height: 14,
                      backgroundColor: "#22c55e",
                      borderRadius: 7,
                      borderWidth: 2,
                      borderColor: isDark ? "#000000" : "#ffffff",
                    }}
                  />
                )}
              </View>
            </Pressable>

            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-1">
                {/* --- FIX 4: Use displayName here instead of item.participant.name --- */}
                <Text
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="font-semibold text-base"
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                {item.lastMessage && (
                  <Text
                    style={{ color: isDark ? "#737373" : "#a1a1aa" }}
                    className="text-xs ml-2"
                  >
                    {formatTime(item.lastMessage.time)}
                  </Text>
                )}
              </View>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center flex-1 mr-2">
                  {messageStatus && (
                    <View className="mr-1">{messageStatus}</View>
                  )}
                  <Text
                    style={{
                      color: unread
                        ? isDark
                          ? "#ffffff"
                          : "#000000"
                        : isDark
                          ? "#737373"
                          : "#a1a1aa",
                    }}
                    className={`text-sm flex-1 ${unread ? "font-medium" : ""}`}
                    numberOfLines={1}
                  >
                    {getMessagePreview(item, currentUserId)}
                  </Text>
                </View>
                {unread && (
                  <View
                    style={{ backgroundColor: "#007AFF" }}
                    className="w-2 h-2 rounded-full"
                  />
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [
      currentUserId,
      isDark,
      filteredChats.length,
      formatTime,
      getMessagePreview,
      getMessageStatus,
      isUnread,
      handleChatPress,
    ],
  );

  const keyExtractor = useCallback((item: ChatListItem) => item.id, []);

  const renderGroupItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push(`/chats/${item.id}`)}
          style={{
            backgroundColor: isDark ? "#000000" : "#ffffff",
            borderBottomWidth: index < filteredGroups.length - 1 ? 0.5 : 0,
            borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
          }}
          className="px-4 py-3"
        >
          <GroupListItem group={item} />
        </TouchableOpacity>
      );
    },
    [isDark, filteredGroups.length, router],
  );

  const renderGroupsEmpty = useCallback(() => {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: isDark ? "#1a1a1a" : "#f3f4f6",
          }}
          className="items-center justify-center mb-4"
        >
          <Ionicons
            name="people-outline"
            size={40}
            color={isDark ? "#525252" : "#d4d4d8"}
          />
        </View>
        <Text
          style={{ color: isDark ? "#737373" : "#a1a1aa" }}
          className="text-base text-center"
        >
          No groups yet
        </Text>
        <Text
          style={{ color: isDark ? "#525252" : "#d4d4d8" }}
          className="text-sm text-center mt-2"
        >
          Create groups to chat with multiple people
        </Text>
      </View>
    );
  }, [isDark]);

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
          <View className="flex-row gap-2 items-center justify-between mb-3">
            <View className="flex-row gap-2 items-center">
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
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/chats/search")}
              className="w-10 h-10 items-center justify-center"
            >
              <Search size={24} color={isDark ? "#ffffff" : "#000000"} />
            </TouchableOpacity>
          </View>

          {/* Segmented Control */}
          <View
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#f3f4f6",
            }}
            className="flex-row rounded-lg p-1 mb-3"
          >
            <Pressable
              onPress={() => setActiveTab("chats")}
              style={{
                backgroundColor:
                  activeTab === "chats"
                    ? isDark
                      ? "#000000"
                      : "#ffffff"
                    : "transparent",
              }}
              className="flex-1 py-2 rounded-md"
            >
              <Text
                style={{
                  color:
                    activeTab === "chats"
                      ? isDark
                        ? "#ffffff"
                        : "#000000"
                      : isDark
                        ? "#737373"
                        : "#a1a1aa",
                }}
                className="text-center font-medium text-sm"
              >
                Chats
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("groups")}
              style={{
                backgroundColor:
                  activeTab === "groups"
                    ? isDark
                      ? "#000000"
                      : "#ffffff"
                    : "transparent",
              }}
              className="flex-1 py-2 rounded-md"
            >
              <Text
                style={{
                  color:
                    activeTab === "groups"
                      ? isDark
                        ? "#ffffff"
                        : "#000000"
                      : isDark
                        ? "#737373"
                        : "#a1a1aa",
                }}
                className="text-center font-medium text-sm"
              >
                Groups
              </Text>
            </Pressable>
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

        {activeTab === "chats" ? (
          filteredChats.length === 0 ? (
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
          )
        ) : (
          <FlatList
            data={filteredGroups}
            keyExtractor={(item) => item.id}
            renderItem={renderGroupItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderGroupsEmpty}
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

        {activeTab === "chats" && (
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
        )}

        {activeTab === "groups" && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/chats/groups/create")}
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
        )}
      </View>
    </SafeAreaView>
  );
};

export default React.memo(ChatsScreen);
