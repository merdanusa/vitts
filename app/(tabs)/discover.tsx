import { Button } from "@/components/ui/button";
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
  Image,
  Platform,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface User {
  id: string;
  name: string;
  login: string;
  avatar: string;
  isOnline: boolean;
}

const SKELETON_COUNT = 5;

const SkeletonUserItem: React.FC<{ animatedValue: Animated.Value }> = ({
  animatedValue,
}) => {
  return (
    <HStack
      className="px-4 py-3 border-b border-gray-200 items-center justify-between"
      style={{ opacity: animatedValue }}
    >
      <HStack className="items-center flex-1">
        <View className="w-10 h-10 rounded-full bg-gray-300 mr-3" />
        <VStack className="flex-1">
          <View className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
          <View className="h-3 bg-gray-200 rounded w-1/2" />
        </VStack>
        <View className="ml-2 w-2 h-2 rounded-full bg-gray-300" />
      </HStack>
      <View className="px-4 py-2 rounded-full bg-gray-300 w-16 h-8" />
    </HStack>
  );
};

const DiscoverScreen = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const navigation = useNavigation();

  const pulseAnim = useState(new Animated.Value(0.5))[0];

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 800,
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
      Alert.alert("Success", "Chat created/opened!");
      navigation.navigate("Chat", { chatId: chat.id });
    } catch (error) {
      Alert.alert("Error", "Failed to add user");
      console.error(error);
    } finally {
      setAddingUserId(null);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <HStack className="px-4 py-3 border-b border-gray-200 items-center justify-between">
      <HStack className="items-center flex-1">
        <Image
          source={{ uri: item.avatar || "https://via.placeholder.com/40" }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <VStack>
          <Text className="font-semibold text-base">{item.name}</Text>
          <Text className="text-sm text-gray-500">@{item.login}</Text>
        </VStack>
        {item.isOnline && (
          <View className="ml-2 w-2 h-2 rounded-full bg-green-500" />
        )}
      </HStack>
      <Button
        className={`px-4 py-2 rounded-full ${addingUserId === item.id ? "bg-gray-300" : "bg-blue-500"}`}
        disabled={addingUserId === item.id}
        onPress={() => handleAddUser(item.id)}
      >
        <Text className="text-white text-sm">
          {addingUserId === item.id ? "Adding..." : "Add"}
        </Text>
      </Button>
    </HStack>
  );

  const renderSkeleton = () => (
    <VStack>
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <SkeletonUserItem key={index} animatedValue={pulseAnim} />
      ))}
    </VStack>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <VStack className="flex-1">
        {/* Search Bar - iOS stylish */}
        <View className="px-4 py-3">
          <TextInput
            className="bg-gray-100 rounded-full px-4 py-3 text-base shadow-sm"
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={Platform.OS === "ios" ? { height: 44 } : {}}
          />
        </View>

        {/* Content */}
        {loading ? (
          renderSkeleton()
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={renderUserItem}
            ListEmptyComponent={() => (
              <Text className="text-center text-gray-500 mt-10">
                {searchQuery.trim() ? "No users found" : "No users available"}
              </Text>
            )}
            className="flex-1"
          />
        )}
      </VStack>
    </SafeAreaView>
  );
};

export default DiscoverScreen;
