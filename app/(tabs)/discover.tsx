import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { createOrGetChat, getAllUsers, searchUsers } from "@/services/api";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface User {
  id: string;
  name: string;
  login: string;
  avatar: string;
  bio?: string;
  isOnline: boolean;
}

const SKELETON_COUNT = 8;

const SkeletonUserItem: React.FC<{ animatedValue: Animated.Value }> = ({
  animatedValue,
}) => {
  return (
    <Animated.View
      style={{ opacity: animatedValue }}
      className="mx-4 mb-3 bg-white rounded-2xl p-4 shadow-sm"
    >
      <HStack className="items-center">
        <View className="w-14 h-14 rounded-full bg-gray-200 mr-3" />
        <VStack className="flex-1">
          <View className="h-4 bg-gray-200 rounded-lg w-3/5 mb-2" />
          <View className="h-3 bg-gray-100 rounded-lg w-2/5" />
        </VStack>
        <View className="w-20 h-9 bg-gray-200 rounded-full" />
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

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        className="mx-4 mb-3 bg-white rounded-2xl shadow-sm"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <HStack className="p-4 items-center">
          {/* Avatar */}
          <View className="mr-3 relative">
            <View className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center">
              <Text className="text-white text-xl font-bold">{initials}</Text>
            </View>
            {item.isOnline && (
              <View
                className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                style={{
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 4,
                }}
              />
            )}
          </View>

          {/* User Info */}
          <VStack className="flex-1 mr-3">
            <Text className="font-semibold text-base text-gray-900 mb-0.5">
              {item.name}
            </Text>
            <Text className="text-sm text-gray-500">@{item.login}</Text>
            {item.bio && (
              <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>
                {item.bio}
              </Text>
            )}
          </VStack>

          {/* Add Button */}
          <TouchableOpacity
            onPress={() => handleAddUser(item.id)}
            disabled={isAdding}
            activeOpacity={0.7}
            className={`px-5 py-2.5 rounded-full ${
              isAdding ? "bg-gray-200" : "bg-blue-500"
            }`}
            style={{
              shadowColor: isAdding ? "transparent" : "#3b82f6",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text
              className={`text-sm font-semibold ${
                isAdding ? "text-gray-400" : "text-white"
              }`}
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
        <SkeletonUserItem key={index} animatedValue={pulseAnim} />
      ))}
    </VStack>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <VStack className="flex-1">
        {/* Header */}
        <View className="px-4 pt-2 pb-3 bg-white">
          <Text className="text-3xl font-bold text-gray-900 mb-4">
            Discover
          </Text>

          {/* Search Bar */}
          <View className="relative">
            <View className="absolute left-3 top-3 z-10">
              <Text className="text-gray-400 text-base">🔍</Text>
            </View>
            <TextInput
              className="bg-gray-100 rounded-xl pl-10 pr-4 py-3 text-base text-gray-900"
              placeholder="Search users..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={Platform.OS === "ios" ? { height: 44 } : {}}
            />
          </View>
        </View>

        {/* Content */}
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
                  <Text className="text-lg font-semibold text-gray-700 mb-1">
                    {searchQuery.trim() ? "No users found" : "No users yet"}
                  </Text>
                  <Text className="text-sm text-gray-400 text-center">
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
