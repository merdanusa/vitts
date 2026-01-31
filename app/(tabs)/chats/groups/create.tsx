import { createGroup } from "@/services/api";
import { RootState } from "@/store";
import { addGroup } from "@/store/groupsSlice";
import { useAppDispatch } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function CreateGroupScreen() {
  const isDark = useSelector((state: RootState) => state.theme.isDark);
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
        participantIds: [],
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
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
          </TouchableOpacity>
          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="text-xl font-semibold"
          >
            New Group
          </Text>
          <TouchableOpacity
            onPress={handleCreate}
            disabled={loading || !groupName.trim()}
            style={{
              opacity: loading || !groupName.trim() ? 0.5 : 1,
            }}
          >
            <Text
              style={{ color: "#007AFF" }}
              className="text-base font-semibold"
            >
              {loading ? "Creating..." : "Create"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Group Icon */}
        <View className="items-center py-8">
          <View
            style={{
              backgroundColor: isDark ? "#262626" : "#f3f4f6",
            }}
            className="w-24 h-24 rounded-full items-center justify-center"
          >
            <Ionicons
              name="people"
              size={48}
              color={isDark ? "#a1a1aa" : "#737373"}
            />
          </View>
          <TouchableOpacity className="mt-3">
            <Text style={{ color: "#007AFF" }} className="font-medium">
              Add Group Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="px-4">
          {/* Group Name */}
          <View
            style={{
              borderBottomWidth: 0.5,
              borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
            }}
            className="pb-3"
          >
            <Text
              style={{ color: isDark ? "#737373" : "#a1a1aa" }}
              className="text-sm font-medium mb-2"
            >
              GROUP NAME
            </Text>
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Enter group name"
              placeholderTextColor={isDark ? "#525252" : "#d4d4d8"}
              style={{
                backgroundColor: isDark ? "#000000" : "#ffffff",
                color: isDark ? "#ffffff" : "#000000",
                ...(Platform.OS === "ios" ? { height: 36 } : {}),
              }}
              className="text-base"
              maxLength={50}
            />
            <Text
              style={{ color: isDark ? "#525252" : "#d4d4d8" }}
              className="text-xs mt-1"
            >
              {groupName.length}/50
            </Text>
          </View>

          {/* Description */}
          <View
            style={{
              borderBottomWidth: 0.5,
              borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
            }}
            className="py-3"
          >
            <Text
              style={{ color: isDark ? "#737373" : "#a1a1aa" }}
              className="text-sm font-medium mb-2"
            >
              DESCRIPTION (OPTIONAL)
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What's this group about?"
              placeholderTextColor={isDark ? "#525252" : "#d4d4d8"}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: isDark ? "#000000" : "#ffffff",
                color: isDark ? "#ffffff" : "#000000",
              }}
              className="text-base"
              maxLength={200}
              textAlignVertical="top"
            />
            <Text
              style={{ color: isDark ? "#525252" : "#d4d4d8" }}
              className="text-xs mt-1"
            >
              {description.length}/200
            </Text>
          </View>

          {/* Privacy Toggle */}
          <TouchableOpacity
            onPress={() => setIsPublic(!isPublic)}
            style={{
              borderBottomWidth: 0.5,
              borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
            }}
            className="flex-row items-center justify-between py-4"
          >
            <View>
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-base font-medium"
              >
                Public Group
              </Text>
              <Text
                style={{ color: isDark ? "#737373" : "#a1a1aa" }}
                className="text-sm mt-1"
              >
                Anyone can find and join
              </Text>
            </View>
            <View
              style={{
                width: 51,
                height: 31,
                borderRadius: 15.5,
                backgroundColor: isPublic ? "#34C759" : isDark ? "#262626" : "#e5e7eb",
                padding: 2,
              }}
              className="justify-center"
            >
              <View
                style={{
                  width: 27,
                  height: 27,
                  borderRadius: 13.5,
                  backgroundColor: "#ffffff",
                  transform: [{ translateX: isPublic ? 20 : 0 }],
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.3,
                  shadowRadius: 1,
                  elevation: 2,
                }}
              />
            </View>
          </TouchableOpacity>

          {/* Info Box */}
          <View
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
            }}
            className="rounded-lg p-4 mt-6"
          >
            <View className="flex-row">
              <Ionicons
                name="information-circle"
                size={20}
                color="#007AFF"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <Text
                style={{ color: isDark ? "#a1a1aa" : "#737373" }}
                className="flex-1 text-sm"
              >
                You can add members after creating the group
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
