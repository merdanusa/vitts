import { GroupListItem } from "@/components/groups/GroupListItem";
import { Group } from "@/services/api";
import { useAppSelector } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

export default function GroupsListScreen() {
  const groups = useAppSelector((state) => state.groups.groups);
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch groups from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCreateGroup = () => {
    router.push("/(tabs)/chats/groups/create" as any);
  };

  const renderGroupItem = ({ item }: { item: Group }) => (
    <GroupListItem group={item} />
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-6">
        <Ionicons name="people-outline" size={48} color="#9CA3AF" />
      </View>
      <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
        No Groups Yet
      </Text>
      <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-8">
        Create a group to start chatting with multiple people at once
      </Text>
      <Pressable
        onPress={handleCreateGroup}
        className="bg-blue-500 px-6 py-3 rounded-lg active:bg-blue-600"
      >
        <Text className="text-white font-semibold text-base">
          Create Group
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      {/* Header */}
      <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Groups
          </Text>
          <Pressable
            onPress={handleCreateGroup}
            className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center active:bg-blue-600"
          >
            <Ionicons name="add" size={24} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Groups List */}
      <FlatList
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          groups.length === 0 ? { flex: 1 } : undefined
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
      />
    </View>
  );
}
