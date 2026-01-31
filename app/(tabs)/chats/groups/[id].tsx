import { getGroupById } from "@/services/api";
import { RootState } from "@/store";
import { setSelectedGroup } from "@/store/groupsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useSelector((state: RootState) => state.theme.isDark);
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
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="small"
            color={isDark ? "#ffffff" : "#000000"}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedGroup) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center">
          <Text
            style={{ color: isDark ? "#737373" : "#a1a1aa" }}
            className="text-base"
          >
            Group not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      {/* Header */}
      <View
        style={{
          borderBottomWidth: 0.5,
          borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
        }}
        className="px-4 py-3"
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
          </TouchableOpacity>

          <View className="flex-1 ml-2">
            <Text
              style={{ color: isDark ? "#ffffff" : "#000000" }}
              className="text-lg font-semibold"
            >
              {selectedGroup.name}
            </Text>
            <Text
              style={{ color: isDark ? "#737373" : "#a1a1aa" }}
              className="text-sm"
            >
              {selectedGroup.participants.length} members
            </Text>
          </View>

          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons
              name="information-circle-outline"
              size={28}
              color="#007AFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages Area */}
      <ScrollView className="flex-1 px-4 py-4">
        {/* TODO: Implement message list similar to regular chat */}
        <View className="items-center justify-center flex-1">
          <View
            style={{
              backgroundColor: isDark ? "#262626" : "#f3f4f6",
            }}
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
          >
            <Ionicons
              name="people"
              size={40}
              color={isDark ? "#a1a1aa" : "#737373"}
            />
          </View>
          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="text-lg font-semibold mb-2"
          >
            {selectedGroup.name}
          </Text>
          <Text
            style={{ color: isDark ? "#737373" : "#a1a1aa" }}
            className="text-sm text-center px-8"
          >
            {selectedGroup.description || "Start chatting with your group"}
          </Text>
        </View>
      </ScrollView>

      {/* Input Area */}
      <View
        style={{
          borderTopWidth: 0.5,
          borderTopColor: isDark ? "#1a1a1a" : "#f3f4f6",
        }}
        className="px-4 py-2"
      >
        <View className="flex-row items-center">
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons
              name="add-circle"
              size={28}
              color="#007AFF"
            />
          </TouchableOpacity>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Message"
            placeholderTextColor={isDark ? "#737373" : "#a1a1aa"}
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
              color: isDark ? "#ffffff" : "#000000",
              borderWidth: 0.5,
              borderColor: isDark ? "#262626" : "#e5e7eb",
              ...(Platform.OS === "ios" ? { minHeight: 36 } : {}),
            }}
            className="flex-1 rounded-full px-4 py-2 text-base mx-2"
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!message.trim()}
            style={{
              opacity: message.trim() ? 1 : 0.5,
            }}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons
              name="arrow-up-circle"
              size={32}
              color="#007AFF"
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
