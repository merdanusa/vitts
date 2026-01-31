import { Group } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

interface GroupListItemProps {
  group: Group;
  onPress?: () => void;
}

export function GroupListItem({ group, onPress }: GroupListItemProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(tabs)/chats/groups/${group.id}` as any);
    }
  };

  const participantCount = group.participants?.length || 0;

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center px-4 py-3 bg-white dark:bg-gray-900 active:bg-gray-50 dark:active:bg-gray-800 border-b border-gray-200 dark:border-gray-800"
    >
      {/* Group Avatar */}
      <View className="mr-3 relative">
        {group.avatar ? (
          <Image
            source={{ uri: group.avatar }}
            className="w-14 h-14 rounded-full"
          />
        ) : (
          <View className="w-14 h-14 rounded-full bg-blue-500 items-center justify-center">
            <Ionicons name="people" size={28} color="white" />
          </View>
        )}
      </View>

      {/* Group Info */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="text-base font-semibold text-gray-900 dark:text-white flex-1"
            numberOfLines={1}
          >
            {group.name}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text className="text-sm text-gray-500 dark:text-gray-400" numberOfLines={1}>
            {participantCount} {participantCount === 1 ? "member" : "members"}
          </Text>
          {group.description && (
            <>
              <Text className="text-sm text-gray-400 mx-2">•</Text>
              <Text
                className="text-sm text-gray-500 dark:text-gray-400 flex-1"
                numberOfLines={1}
              >
                {group.description}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );
}
