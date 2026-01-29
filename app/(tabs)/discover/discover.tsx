import { IOSAlert, showIOSAlert } from "@/components/IOSAlertDialog";
import { WillCard } from "@/components/WillCard";
import {
  createOrGetChat,
  getAllUsers,
  getAllWills,
  likeWill,
  searchUsers,
  unlikeWill,
  Will,
} from "@/services/api";
import { RootState } from "@/store";
import { useRouter } from "expo-router";
import { Search, Send } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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

interface User {
  id: string;
  name: string;
  login: string;
  avatar: string;
  bio?: string;
  isOnline: boolean;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const DiscoverScreen = () => {
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [wills, setWills] = useState<Will[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"wills" | "users">("wills");
  const [likedWills, setLikedWills] = useState<Set<string>>(new Set());

  const handleSearch = async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length > 0 && trimmed.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      if (activeTab === "users") {
        const results =
          trimmed === "" ? await getAllUsers() : await searchUsers(query);
        setUsers(results);
      }
    } catch (error) {
      setAlertConfig(showIOSAlert.simple("Error", "Failed to load users"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadWills = async () => {
    setLoading(true);
    try {
      const response = await getAllWills({ page: 1, limit: 20 });
      setWills(response.data);
    } catch (error) {
      setAlertConfig(showIOSAlert.simple("Error", "Failed to load wills"));
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeTab === "wills") {
      loadWills();
    }
  }, [activeTab]);

  useEffect(() => {
    const timeout = setTimeout(() => handleSearch(searchQuery), 500);
    return () => clearTimeout(timeout);
  }, [searchQuery, activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeTab === "wills") {
      loadWills();
    } else {
      handleSearch(searchQuery);
    }
  }, [activeTab, searchQuery]);

  const handleStartChat = async (userId: string) => {
    setAddingUserId(userId);
    try {
      const chat = await createOrGetChat({ otherUserId: userId });
      router.push(`/chats/${chat.id}`);
    } catch (error) {
      setAlertConfig(showIOSAlert.simple("Error", "Failed to create chat"));
      console.error(error);
    } finally {
      setAddingUserId(null);
    }
  };

  const handleLike = async (willId: string) => {
    const isLiked = likedWills.has(willId);

    setLikedWills((prev) => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(willId);
      } else {
        newSet.add(willId);
      }
      return newSet;
    });

    setWills((prev) =>
      prev.map((will) =>
        will.id === willId
          ? {
              ...will,
              likesCount: isLiked ? will.likesCount - 1 : will.likesCount + 1,
            }
          : will,
      ),
    );

    try {
      if (isLiked) {
        await unlikeWill(willId);
      } else {
        await likeWill(willId);
      }
    } catch (error) {
      setLikedWills((prev) => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(willId);
        } else {
          newSet.delete(willId);
        }
        return newSet;
      });

      setWills((prev) =>
        prev.map((will) =>
          will.id === willId
            ? {
                ...will,
                likesCount: isLiked ? will.likesCount + 1 : will.likesCount - 1,
              }
            : will,
        ),
      );
    }
  };

  const renderWillItem = ({ item }: { item: Will }) => (
    <WillCard
      item={item}
      isDark={isDark}
      isLiked={likedWills.has(item.id)}
      onLike={handleLike}
    />
  );

  const renderUserItem = useCallback(
    ({ item }: { item: User }) => {
      const initials = getInitials(item.name);
      const isAdding = addingUserId === item.id;
      const hasAvatar =
        item.avatar && item.avatar !== "M" && item.avatar !== "";

      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleStartChat(item.id)}
          disabled={isAdding}
          style={{
            backgroundColor: isDark ? "#000000" : "#ffffff",
            borderBottomWidth: 0.5,
            borderBottomColor: isDark ? "#2c2c2e" : "#e5e7eb",
          }}
          className="px-4 py-3"
        >
          <View className="flex-row items-center">
            <Pressable
              onPress={() => {
                router.push(`/discover/${item.id}`);
              }}
            >
              <View className="mr-3 relative">
                {hasAvatar ? (
                  <Image
                    source={{ uri: item.avatar }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                  />
                ) : (
                  <View
                    style={{
                      backgroundColor: isDark ? "#1c1c1e" : "#f3f4f6",
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                    }}
                    className="items-center justify-center"
                  >
                    <Text
                      style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                      className="text-lg font-medium"
                    >
                      {initials}
                    </Text>
                  </View>
                )}
                {item.isOnline && (
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
            </Pressable>

            <View className="flex-1 mr-3">
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="font-medium text-base"
              >
                {item.name}
              </Text>
              <Text
                style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                className="text-sm"
              >
                @{item.login}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: isAdding
                  ? isDark
                    ? "#1c1c1e"
                    : "#f3f4f6"
                  : "#007AFF",
                width: 36,
                height: 36,
                borderRadius: 18,
              }}
              className="items-center justify-center"
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="#8e8e93" />
              ) : (
                <Send size={18} color="#ffffff" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [addingUserId, isDark, handleStartChat],
  );

  const keyExtractor = useCallback((item: any) => item.id, []);

  const renderHeader = () => (
    <View
      style={{
        backgroundColor: isDark ? "#000000" : "#ffffff",
        borderBottomWidth: 0.5,
        borderBottomColor: isDark ? "#2c2c2e" : "#e5e7eb",
      }}
      className="px-4 pt-2 pb-3"
    >
      <Text
        style={{ color: isDark ? "#ffffff" : "#000000" }}
        className="text-3xl font-bold mb-3"
      >
        Discover
      </Text>

      {activeTab === "users" && (
        <View
          style={{
            backgroundColor: isDark ? "#1c1c1e" : "#f9fafb",
            borderWidth: 0.5,
            borderColor: isDark ? "#2c2c2e" : "#e5e7eb",
          }}
          className="rounded-xl px-4 py-2 flex-row items-center mb-3"
        >
          <Search size={18} color={isDark ? "#8e8e93" : "#6b7280"} />
          <TextInput
            style={{
              color: isDark ? "#ffffff" : "#000000",
              ...(Platform.OS === "ios" ? { height: 40 } : {}),
            }}
            className="flex-1 ml-2 text-base"
            placeholder="Search users..."
            placeholderTextColor={isDark ? "#8e8e93" : "#9ca3af"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>
      )}

      <View
        style={{
          backgroundColor: isDark ? "#1c1c1e" : "#f3f4f6",
        }}
        className="flex-row rounded-xl p-1"
      >
        <TouchableOpacity
          onPress={() => setActiveTab("wills")}
          style={{
            backgroundColor:
              activeTab === "wills"
                ? isDark
                  ? "#000000"
                  : "#ffffff"
                : "transparent",
          }}
          className="flex-1 py-2 rounded-lg"
          activeOpacity={0.7}
        >
          <Text
            style={{
              color:
                activeTab === "wills"
                  ? isDark
                    ? "#ffffff"
                    : "#000000"
                  : isDark
                    ? "#8e8e93"
                    : "#6b7280",
            }}
            className="text-center font-semibold text-sm"
          >
            Wills
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("users")}
          style={{
            backgroundColor:
              activeTab === "users"
                ? isDark
                  ? "#000000"
                  : "#ffffff"
                : "transparent",
          }}
          className="flex-1 py-2 rounded-lg"
          activeOpacity={0.7}
        >
          <Text
            style={{
              color:
                activeTab === "users"
                  ? isDark
                    ? "#ffffff"
                    : "#000000"
                  : isDark
                    ? "#8e8e93"
                    : "#6b7280",
            }}
            className="text-center font-semibold text-sm"
          >
            Users
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View className="items-center justify-center mt-32 px-8">
        <Text
          style={{ color: isDark ? "#8e8e93" : "#9ca3af" }}
          className="text-base text-center"
        >
          {activeTab === "wills"
            ? "No wills yet"
            : searchQuery.trim()
              ? "No users found"
              : "Start searching"}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      <View className="flex-1">
        {loading &&
        (activeTab === "wills" ? wills.length === 0 : users.length === 0) ? (
          <View className="flex-1">
            {renderHeader()}
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          </View>
        ) : (
          <FlatList
            data={activeTab === "wills" ? wills : users}
            keyExtractor={keyExtractor}
            renderItem={activeTab === "wills" ? renderWillItem : renderUserItem}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={10}
          />
        )}
      </View>

      {alertConfig && (
        <IOSAlert
          visible={true}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onDismiss={() => setAlertConfig(null)}
          isDark={isDark}
        />
      )}
    </SafeAreaView>
  );
};

export default React.memo(DiscoverScreen);
