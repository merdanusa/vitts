import { GroupListItem } from "@/components/groups/GroupListItem";
import { Group } from "@/services/api";
import { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
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

export default function GroupsListScreen() {
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const groups = useAppSelector((state) => state.groups.groups);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch groups from API
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleCreateGroup = useCallback(() => {
    router.push("/(tabs)/chats/groups/create" as any);
  }, []);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGroupItem = useCallback(
    ({ item, index }: { item: Group; index: number }) => (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.7}
        onPress={() => router.push(`/(tabs)/chats/groups/${item.id}` as any)}
        style={{
          backgroundColor: isDark ? "#000000" : "#ffffff",
          borderBottomWidth: index < filteredGroups.length - 1 ? 0.5 : 0,
          borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
        }}
        className="px-4 py-3"
      >
        <GroupListItem group={item} />
      </TouchableOpacity>
    ),
    [filteredGroups.length, isDark]
  );

  const keyExtractor = useCallback((item: Group) => item.id, []);

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: isDark ? "#1a1a1a" : "#f3f4f6",
        }}
        className="items-center justify-center mb-6"
      >
        <Ionicons
          name="people-outline"
          size={60}
          color={isDark ? "#525252" : "#d4d4d8"}
        />
      </View>
      <Text
        style={{ color: isDark ? "#ffffff" : "#000000" }}
        className="text-xl font-semibold mb-2 text-center"
      >
        No Groups Yet
      </Text>
      <Text
        style={{ color: isDark ? "#737373" : "#a1a1aa" }}
        className="text-base text-center mb-8"
      >
        Create a group to start chatting with multiple people
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleCreateGroup}
        style={{ backgroundColor: "#007AFF" }}
        className="px-8 py-3 rounded-full"
      >
        <Text className="text-white font-semibold text-base">
          Create Group
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (groups.length === 0 && !searchQuery) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1"
      >
        {renderEmptyState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      <View className="flex-1">
        {/* Header */}
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
                Groups
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCreateGroup}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons
                name="add-circle"
                size={32}
                color="#007AFF"
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="relative">
            <View className="absolute left-3 top-2.5 z-10">
              <Ionicons
                name="search"
                size={16}
                color={isDark ? "#737373" : "#a1a1aa"}
              />
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
              placeholder="Search groups"
              placeholderTextColor={isDark ? "#737373" : "#a1a1aa"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Groups List */}
        {filteredGroups.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text
              style={{ color: isDark ? "#737373" : "#a1a1aa" }}
              className="text-base text-center"
            >
              {searchQuery ? "No groups found" : "No groups"}
            </Text>
            {!searchQuery && (
              <Text
                style={{ color: isDark ? "#525252" : "#d4d4d8" }}
                className="text-sm text-center mt-2"
              >
                Create a new group to get started
              </Text>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredGroups}
            keyExtractor={keyExtractor}
            renderItem={renderGroupItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={isDark ? "#ffffff" : "#000000"}
              />
            }
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={10}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
