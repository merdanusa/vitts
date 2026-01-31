import { getGroupById } from "@/services/api";
import { setSelectedGroup } from "@/store/groupsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const selectedGroup = useAppSelector((state) => state.groups.selectedGroup);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id) {
      loadGroup();
    }
  }, [id]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const group = await getGroupById(id);
      dispatch(setSelectedGroup(group));
    } catch (error) {
      console.error("Failed to load group:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;
    // TODO: Send message via socket
    console.log("Send message:", message);
    setMessage("");
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!selectedGroup) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950 items-center justify-center">
        <Text className="text-gray-500 dark:text-gray-400">
          Group not found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      {/* Header */}
      <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
          </Pressable>

          <View className="flex-1 ml-2">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedGroup.name}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {selectedGroup.participants.length} members
            </Text>
          </View>

          <Pressable className="w-10 h-10 items-center justify-center">
            <Ionicons name="information-circle-outline" size={28} color="#007AFF" />
          </Pressable>
        </View>
      </View>

      {/* Messages Area */}
      <ScrollView className="flex-1 px-4 py-4">
        {/* TODO: Implement message list similar to regular chat */}
        <View className="items-center justify-center flex-1">
          <View className="w-20 h-20 rounded-full bg-blue-500 items-center justify-center mb-4">
            <Ionicons name="people" size={40} color="white" />
          </View>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {selectedGroup.name}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center px-8">
            {selectedGroup.description || "Start chatting with your group"}
          </Text>
        </View>
      </ScrollView>

      {/* Input Area */}
      <View className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-2">
        <View className="flex-row items-center">
          <Pressable className="w-10 h-10 items-center justify-center">
            <Ionicons name="add-circle" size={28} color="#007AFF" />
          </Pressable>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Message"
            placeholderTextColor="#9CA3AF"
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-base text-gray-900 dark:text-white mx-2"
            multiline
            maxLength={1000}
          />

          <Pressable
            onPress={handleSend}
            disabled={!message.trim()}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              message.trim() ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <Ionicons
              name="arrow-up"
              size={24}
              color={message.trim() ? "white" : "#9CA3AF"}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
