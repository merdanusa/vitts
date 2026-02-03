import { getInitials } from "@/utils/helpers";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Crown,
  Shield,
  UserMinus,
  UserPlus,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  login?: string;
  isOnline?: boolean;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

export default function GroupInfoScreen() {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const currentUserId = useSelector((state: RootState) => state.user.id);

  const [groupData, setGroupData] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>("member");

  useEffect(() => {
    loadGroupInfo();
  }, [chatId]);

  const loadGroupInfo = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await getGroupInfo(chatId);
      // setGroupData(data.chat);
      // setParticipants(data.participants);

      // Mock data for now
      setGroupData({
        id: chatId,
        name: "Development Team",
        description: "Team discussion for project updates",
        avatar: "",
        type: "group",
        createdBy: "user1",
        createdAt: new Date().toISOString(),
      });

      setParticipants([
        {
          id: "user1",
          name: "John Doe",
          avatar: "",
          login: "johndoe",
          isOnline: true,
          role: "owner",
          joinedAt: new Date().toISOString(),
        },
        {
          id: "user2",
          name: "Jane Smith",
          avatar: "",
          login: "janesmith",
          isOnline: false,
          role: "admin",
          joinedAt: new Date().toISOString(),
        },
      ]);

      // Find current user's role
      const currentUser = participants.find((p) => p.id === currentUserId);
      if (currentUser) {
        setCurrentUserRole(currentUser.role);
      }
    } catch (error) {
      console.error("Failed to load group info:", error);
      Alert.alert("Error", "Failed to load group information");
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = () => {
    // TODO: Navigate to add participant screen
    Alert.alert("Add Member", "Feature coming soon");
  };

  const handleRemoveParticipant = (participantId: string) => {
    Alert.alert(
      "Remove Member",
      "Are you sure you want to remove this member from the group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: Call API to remove participant
              // await removeParticipant(chatId, participantId);
              loadGroupInfo();
            } catch (error) {
              Alert.alert("Error", "Failed to remove member");
            }
          },
        },
      ],
    );
  };

  const handleChangeRole = (participantId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "member" : "admin";
    Alert.alert(
      "Change Role",
      `Change this member's role to ${newRole}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              // TODO: Call API to update role
              // await updateParticipantRole(chatId, participantId, newRole);
              loadGroupInfo();
            } catch (error) {
              Alert.alert("Error", "Failed to update role");
            }
          },
        },
      ],
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      "Leave Group",
      "Are you sure you want to leave this group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: Call API to leave group
              // await removeParticipant(chatId, currentUserId);
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to leave group");
            }
          },
        },
      ],
    );
  };

  const renderParticipantItem = ({ item }: { item: Participant }) => {
    const hasAvatar = item.avatar && item.avatar !== "M" && item.avatar !== "";
    const initials = getInitials(item.name);
    const isCurrentUser = item.id === currentUserId;
    const canManage =
      (currentUserRole === "owner" || currentUserRole === "admin") &&
      item.role !== "owner" &&
      !isCurrentUser;

    return (
      <View
        className={`flex-row items-center px-4 py-3 border-b ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}
      >
        {/* Avatar */}
        <View className="mr-3 relative">
          {hasAvatar ? (
            <Image
              source={{ uri: item.avatar }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <View
              className={`w-12 h-12 rounded-full items-center justify-center ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-base font-bold ${
                  isDark ? "text-gray-100" : "text-gray-700"
                }`}
              >
                {initials}
              </Text>
            </View>
          )}
          {item.isOnline && (
            <View
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 ${
                isDark ? "border-black" : "border-white"
              }`}
            />
          )}
        </View>

        {/* User info */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className={`text-base font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {item.name}
              {isCurrentUser && " (You)"}
            </Text>
            {item.role === "owner" && (
              <Crown size={16} color="#f59e0b" strokeWidth={2.5} />
            )}
            {item.role === "admin" && (
              <Shield size={16} color="#3b82f6" strokeWidth={2.5} />
            )}
          </View>
          <Text
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
            {item.login && ` • @${item.login}`}
          </Text>
        </View>

        {/* Actions */}
        {canManage && (
          <View className="flex-row gap-2">
            {currentUserRole === "owner" && item.role !== "admin" && (
              <TouchableOpacity
                onPress={() => handleChangeRole(item.id, item.role)}
                className={`p-2 rounded-full ${
                  isDark ? "bg-blue-500/20" : "bg-blue-100"
                }`}
              >
                <Shield size={18} color="#3b82f6" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => handleRemoveParticipant(item.id)}
              className={`p-2 rounded-full ${
                isDark ? "bg-red-500/20" : "bg-red-100"
              }`}
            >
              <UserMinus size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View
        className={`flex-1 items-center justify-center ${
          isDark ? "bg-black" : "bg-white"
        }`}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!groupData) {
    return (
      <View
        className={`flex-1 items-center justify-center ${
          isDark ? "bg-black" : "bg-white"
        }`}
      >
        <Text className={isDark ? "text-white" : "text-gray-900"}>
          Group not found
        </Text>
      </View>
    );
  }

  const hasAvatar =
    groupData.avatar && groupData.avatar !== "M" && groupData.avatar !== "";
  const initials = getInitials(groupData.name);

  return (
    <View className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}>
      {/* Header */}
      <View
        className={`pt-12 pb-4 px-4 border-b ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ChevronLeft
              size={24}
              color={isDark ? "#ffffff" : "#000000"}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
          <Text
            className={`text-lg font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Group Info
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <FlatList
        data={participants}
        renderItem={renderParticipantItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Group details */}
            <View className="items-center py-6 px-4">
              {/* Group avatar */}
              {hasAvatar ? (
                <Image
                  source={{ uri: groupData.avatar }}
                  className="w-24 h-24 rounded-full mb-4"
                />
              ) : (
                <View
                  className={`w-24 h-24 rounded-full items-center justify-center mb-4 ${
                    isDark
                      ? "bg-gradient-to-br from-blue-600 to-purple-600"
                      : "bg-gradient-to-br from-blue-500 to-purple-500"
                  }`}
                >
                  <Text className="text-3xl font-bold text-white">
                    {initials}
                  </Text>
                </View>
              )}

              {/* Group name */}
              <Text
                className={`text-2xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {groupData.name}
              </Text>

              {/* Group description */}
              {groupData.description && (
                <Text
                  className={`text-base text-center mb-2 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {groupData.description}
                </Text>
              )}

              {/* Member count */}
              <Text
                className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {participants.length}{" "}
                {participants.length === 1 ? "member" : "members"}
              </Text>
            </View>

            {/* Action buttons */}
            <View className="px-4 pb-4 gap-3">
              {(currentUserRole === "owner" || currentUserRole === "admin") && (
                <TouchableOpacity
                  onPress={handleAddParticipant}
                  className={`flex-row items-center justify-center py-3 px-4 rounded-lg ${
                    isDark ? "bg-blue-500/20" : "bg-blue-100"
                  }`}
                >
                  <UserPlus size={20} color="#3b82f6" strokeWidth={2.5} />
                  <Text className="text-blue-500 font-semibold ml-2">
                    Add Members
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleLeaveGroup}
                className={`flex-row items-center justify-center py-3 px-4 rounded-lg ${
                  isDark ? "bg-red-500/20" : "bg-red-100"
                }`}
              >
                <LogOut size={20} color="#ef4444" strokeWidth={2.5} />
                <Text className="text-red-500 font-semibold ml-2">
                  Leave Group
                </Text>
              </TouchableOpacity>
            </View>

            {/* Participants header */}
            <View
              className={`px-4 py-3 border-t border-b ${
                isDark
                  ? "bg-gray-900/50 border-gray-800"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                MEMBERS
              </Text>
            </View>
          </>
        }
      />
    </View>
  );
}
