import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { createOrGetChat, getAllUsers, searchUsers } from "@/services/api";
import { RootState } from "@/store";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Platform,
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

const SKELETON_COUNT = 8;

const SkeletonUserItem: React.FC<{
  animatedValue: Animated.Value;
  isDark: boolean;
}> = ({ animatedValue, isDark }) => {
  return (
    <Animated.View
      style={{
        opacity: animatedValue,
        backgroundColor: isDark ? "#1f1f1f" : "#ffffff",
      }}
      className="mx-4 mb-3 rounded-2xl p-4"
    >
      <HStack className="items-center">
        <View
          style={{ backgroundColor: isDark ? "#262626" : "#e5e7eb" }}
          className="w-14 h-14 rounded-full mr-3"
        />
        <VStack className="flex-1">
          <View
            style={{ backgroundColor: isDark ? "#262626" : "#e5e7eb" }}
            className="h-4 rounded-lg w-3/5 mb-2"
          />
          <View
            style={{ backgroundColor: isDark ? "#1a1a1a" : "#f3f4f6" }}
            className="h-3 rounded-lg w-2/5"
          />
        </VStack>
        <View
          style={{ backgroundColor: isDark ? "#262626" : "#e5e7eb" }}
          className="w-20 h-9 rounded-full"
        />
      </HStack>
    </Animated.View>
  );
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const DiscoverScreen = () => {
  const isDark = useSelector((state: RootState) => state.theme.isDark);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const navigation = useNavigation();

  const pulseAnim = useState(new Animated.Value(0.4))[0];

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [loading]);

  const handleSearch = async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length > 0 && trimmed.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      let results: User[];
      if (trimmed === "") {
        results = await getAllUsers();
      } else {
        results = await searchUsers(query);
      }
      setUsers(results);
    } catch (error) {
      Alert.alert("Error", "Failed to load users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleAddUser = async (userId: string) => {
    setAddingUserId(userId);
    try {
      const chat = await createOrGetChat({ otherUserId: userId });
      Alert.alert("Success", "Chat created!");
      navigation.navigate("Chat", { chatId: chat.id });
    } catch (error) {
      Alert.alert("Error", "Failed to create chat");
      console.error(error);
    } finally {
      setAddingUserId(null);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const initials = getInitials(item.name);
    const isAdding = addingUserId === item.id;
    const hasAvatar = item.avatar && item.avatar !== "M" && item.avatar !== "";

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={{
          backgroundColor: isDark ? "#1f1f1f" : "#ffffff",
          shadowColor: isDark ? "#000" : "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0.3 : 0.05,
          shadowRadius: 3,
          elevation: 2,
        }}
        className="mx-4 mb-3 rounded-2xl"
      >
        <HStack className="p-4 items-center">
          <View className="mr-3 relative">
            {hasAvatar ? (
              <Image
                source={{ uri: item.avatar }}
                style={{ width: 56, height: 56, borderRadius: 28 }}
              />
            ) : (
              <View
                style={{
                  backgroundColor: isDark ? "#3b82f6" : "#3b82f6",
                }}
                className="w-14 h-14 rounded-full items-center justify-center"
              >
                <Text className="text-white text-xl font-bold">{initials}</Text>
              </View>
            )}
            {item.isOnline && (
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 16,
                  height: 16,
                  backgroundColor: "#22c55e",
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: isDark ? "#1f1f1f" : "#ffffff",
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 4,
                }}
              />
            )}
          </View>

          <VStack className="flex-1 mr-3">
            <Text
              style={{ color: isDark ? "#ffffff" : "#111827" }}
              className="font-semibold text-base mb-0.5"
            >
              {item.name}
            </Text>
            <Text
              style={{ color: isDark ? "#a1a1aa" : "#6b7280" }}
              className="text-sm"
            >
              @{item.login}
            </Text>
            {item.bio && (
              <Text
                style={{ color: isDark ? "#737373" : "#9ca3af" }}
                className="text-xs mt-1"
                numberOfLines={1}
              >
                {item.bio}
              </Text>
            )}
          </VStack>

          <TouchableOpacity
            onPress={() => handleAddUser(item.id)}
            disabled={isAdding}
            activeOpacity={0.7}
            style={{
              backgroundColor: isAdding
                ? isDark
                  ? "#262626"
                  : "#e5e7eb"
                : "#3b82f6",
              shadowColor: isAdding ? "transparent" : "#3b82f6",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
            className="px-5 py-2.5 rounded-full"
          >
            <Text
              style={{
                color: isAdding ? (isDark ? "#737373" : "#9ca3af") : "#ffffff",
              }}
              className="text-sm font-semibold"
            >
              {isAdding ? "Adding..." : "Add"}
            </Text>
          </TouchableOpacity>
        </HStack>
      </TouchableOpacity>
    );
  };

  const renderSkeleton = () => (
    <VStack className="mt-2">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <SkeletonUserItem
          key={index}
          animatedValue={pulseAnim}
          isDark={isDark}
        />
      ))}
    </VStack>
  );

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#f9fafb" }}
      className="flex-1"
    >
      <VStack className="flex-1">
        <View
          style={{
            backgroundColor: isDark ? "#000000" : "#ffffff",
            borderBottomWidth: isDark ? 0.5 : 0,
            borderBottomColor: isDark ? "#262626" : "transparent",
          }}
          className="px-4 pt-2 pb-3"
        >
          <Text
            style={{ color: isDark ? "#ffffff" : "#111827" }}
            className="text-3xl font-bold mb-4"
          >
            Discover
          </Text>

          <View className="relative">
            <View className="absolute left-3 top-3 z-10">
              <Text className="text-gray-400 text-base">🔍</Text>
            </View>
            <TextInput
              style={{
                backgroundColor: isDark ? "#1f1f1f" : "#f3f4f6",
                color: isDark ? "#ffffff" : "#111827",
                ...(Platform.OS === "ios" ? { height: 44 } : {}),
              }}
              className="rounded-xl pl-10 pr-4 py-3 text-base"
              placeholder="Search users..."
              placeholderTextColor={isDark ? "#737373" : "#9ca3af"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
        </View>

        <View className="flex-1 pt-3">
          {loading ? (
            renderSkeleton()
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={renderUserItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={() => (
                <VStack className="items-center justify-center mt-20 px-8">
                  <Text className="text-6xl mb-4">👥</Text>
                  <Text
                    style={{ color: isDark ? "#ffffff" : "#374151" }}
                    className="text-lg font-semibold mb-1"
                  >
                    {searchQuery.trim() ? "No users found" : "No users yet"}
                  </Text>
                  <Text
                    style={{ color: isDark ? "#737373" : "#9ca3af" }}
                    className="text-sm text-center"
                  >
                    {searchQuery.trim()
                      ? "Try searching with a different keyword"
                      : "Start searching to find people"}
                  </Text>
                </VStack>
              )}
            />
          )}
        </View>
      </VStack>
    </SafeAreaView>
  );
};

export default DiscoverScreen;
