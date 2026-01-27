import { IOSAlert, showIOSAlert } from "@/components/IOSAlertDialog";
import { createOrGetChat, getAllUsers, searchUsers } from "@/services/api";
import { RootState } from "@/store";
import { useRouter } from "expo-router";
import { Send } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
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
  const [loading, setLoading] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<any>(null);

  const handleSearch = async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length > 0 && trimmed.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const results =
        trimmed === "" ? await getAllUsers() : await searchUsers(query);
      setUsers(results);
    } catch (error) {
      setAlertConfig(showIOSAlert.simple("Error", "Failed to load users"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => handleSearch(searchQuery), 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

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
            borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
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
                      backgroundColor: isDark ? "#262626" : "#f3f4f6",
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                    }}
                    className="items-center justify-center"
                  >
                    <Text
                      style={{ color: isDark ? "#a1a1aa" : "#737373" }}
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
                style={{ color: isDark ? "#737373" : "#a1a1aa" }}
                className="text-sm"
              >
                @{item.login}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: isAdding
                  ? isDark
                    ? "#1a1a1a"
                    : "#f3f4f6"
                  : "#007AFF",
                width: 36,
                height: 36,
                borderRadius: 18,
              }}
              className="items-center justify-center"
            >
              {isAdding ? (
                <ActivityIndicator
                  size="small"
                  color={isDark ? "#737373" : "#a1a1aa"}
                />
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

  const keyExtractor = useCallback((item: User) => item.id, []);

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      <View className="flex-1">
        <View
          style={{
            borderBottomWidth: 0.5,
            borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
          }}
          className="px-4 pt-2 pb-3"
        >
          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="text-2xl font-bold mb-3"
          >
            Discover
          </Text>

          <TextInput
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
              color: isDark ? "#ffffff" : "#000000",
              borderWidth: 0.5,
              borderColor: isDark ? "#262626" : "#e5e7eb",
              ...(Platform.OS === "ios" ? { height: 40 } : {}),
            }}
            className="rounded-lg px-4 py-2 text-base"
            placeholder="Search..."
            placeholderTextColor={isDark ? "#737373" : "#a1a1aa"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>

        <View className="flex-1">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator
                size="small"
                color={isDark ? "#ffffff" : "#000000"}
              />
            </View>
          ) : (
            <FlatList
              data={users}
              keyExtractor={keyExtractor}
              renderItem={renderUserItem}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              windowSize={10}
              ListEmptyComponent={() => (
                <View className="items-center justify-center mt-32 px-8">
                  <Text
                    style={{ color: isDark ? "#737373" : "#a1a1aa" }}
                    className="text-base text-center"
                  >
                    {searchQuery.trim() ? "No users found" : "Start searching"}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>

      {alertConfig && (
        <IOSAlert
          visible={true}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onDismiss={() => setAlertConfig(null)}
        />
      )}
    </SafeAreaView>
  );
};

export default React.memo(DiscoverScreen);
