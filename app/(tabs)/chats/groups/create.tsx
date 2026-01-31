import { createGroup } from "@/services/api";
import { addGroup } from "@/store/groupsSlice";
import { useAppDispatch } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CreateGroupScreen() {
  const dispatch = useAppDispatch();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    try {
      setLoading(true);
      const newGroup = await createGroup({
        name: groupName.trim(),
        description: description.trim() || undefined,
        participantIds: [], // TODO: Add member selection
        isPublic,
      });

      dispatch(addGroup(newGroup));
      Alert.alert("Success", "Group created successfully!");
      router.back();
    } catch (error: any) {
      console.error("Failed to create group:", error);
      Alert.alert("Error", error.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      {/* Header */}
      <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
          </Pressable>
          <Text className="text-xl font-semibold text-gray-900 dark:text-white">
            New Group
          </Text>
          <Pressable
            onPress={handleCreate}
            disabled={loading || !groupName.trim()}
            className={`px-4 py-2 rounded-lg ${
              loading || !groupName.trim()
                ? "bg-gray-300 dark:bg-gray-700"
                : "bg-blue-500 active:bg-blue-600"
            }`}
          >
            <Text
              className={`font-semibold ${
                loading || !groupName.trim()
                  ? "text-gray-500"
                  : "text-white"
              }`}
            >
              {loading ? "Creating..." : "Create"}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Group Icon */}
        <View className="items-center py-8">
          <View className="w-24 h-24 rounded-full bg-blue-500 items-center justify-center">
            <Ionicons name="people" size={48} color="white" />
          </View>
          <Pressable className="mt-3">
            <Text className="text-blue-500 font-medium">Add Group Photo</Text>
          </Pressable>
        </View>

        {/* Form Fields */}
        <View className="px-4 space-y-4">
          {/* Group Name */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Group Name
            </Text>
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Enter group name"
              placeholderTextColor="#9CA3AF"
              className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-white"
              maxLength={50}
            />
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {groupName.length}/50
            </Text>
          </View>

          {/* Description */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What's this group about?"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-white"
              maxLength={200}
              textAlignVertical="top"
            />
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description.length}/200
            </Text>
          </View>

          {/* Privacy Toggle */}
          <View className="mt-6">
            <Pressable
              onPress={() => setIsPublic(!isPublic)}
              className="flex-row items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-4"
            >
              <View>
                <Text className="text-base font-medium text-gray-900 dark:text-white">
                  Public Group
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Anyone can find and join this group
                </Text>
              </View>
              <View
                className={`w-12 h-7 rounded-full ${
                  isPublic ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                } justify-center`}
              >
                <View
                  className={`w-5 h-5 rounded-full bg-white ${
                    isPublic ? "ml-6" : "ml-1"
                  }`}
                />
              </View>
            </Pressable>
          </View>

          {/* Info Box */}
          <View className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <View className="flex-row">
              <Ionicons
                name="information-circle"
                size={20}
                color="#3B82F6"
                className="mr-2 mt-0.5"
              />
              <Text className="flex-1 text-sm text-blue-700 dark:text-blue-300">
                You can add members after creating the group
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
