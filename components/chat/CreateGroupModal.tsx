import { Camera, Check, Search, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getInitials } from "@/utils/helpers";
import { getAllUsers, SearchUser } from "@/services/api";

const { height } = Dimensions.get("window");

interface CreateGroupModalProps {
  visible: boolean;
  isDark: boolean;
  currentUserId: string;
  onClose: () => void;
  onCreateGroup: (data: {
    name: string;
    description?: string;
    avatar?: string;
    participantIds: string[];
  }) => Promise<void>;
  onPickImage?: () => Promise<string | null>;
}

export function CreateGroupModal({
  visible,
  isDark,
  currentUserId,
  onClose,
  onCreateGroup,
  onPickImage,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupAvatar, setGroupAvatar] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<SearchUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SearchUser[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [step, setStep] = useState<"select" | "details">("select");

  // Load users when modal opens
  useEffect(() => {
    if (visible) {
      loadUsers();
      // Reset state
      setGroupName("");
      setGroupDescription("");
      setGroupAvatar("");
      setSelectedUsers(new Set());
      setSearchQuery("");
      setStep("select");
    }
  }, [visible]);

  // Filter users based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(allUsers);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        allUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.login?.toLowerCase().includes(query),
        ),
      );
    }
  }, [searchQuery, allUsers]);

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const users = await getAllUsers();
      // Filter out current user
      const filteredUsers = users.filter((user) => user.id !== currentUserId);
      setAllUsers(filteredUsers);
      setFilteredUsers(filteredUsers);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleNext = () => {
    if (selectedUsers.size === 0) return;
    setStep("details");
  };

  const handleBack = () => {
    setStep("select");
  };

  const handlePickImage = async () => {
    if (!onPickImage) return;
    const imageUri = await onPickImage();
    if (imageUri) {
      setGroupAvatar(imageUri);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return;

    try {
      setIsCreating(true);
      await onCreateGroup({
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        avatar: groupAvatar || undefined,
        participantIds: Array.from(selectedUsers),
      });
      onClose();
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderUserItem = ({ item }: { item: SearchUser }) => {
    const isSelected = selectedUsers.has(item.id);
    const hasAvatar = item.avatar && item.avatar !== "M" && item.avatar !== "";
    const initials = getInitials(item.name);

    return (
      <TouchableOpacity
        onPress={() => toggleUserSelection(item.id)}
        className="flex-row items-center py-3 px-4"
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
          <Text
            className={`text-base font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {item.name}
          </Text>
          {item.login && (
            <Text
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              @{item.login}
            </Text>
          )}
        </View>

        {/* Checkbox */}
        <View
          className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            isSelected
              ? "bg-blue-500 border-blue-500"
              : isDark
                ? "border-gray-600"
                : "border-gray-300"
          }`}
        >
          {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSelectStep = () => (
    <>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-4 border-b"
        style={{ borderBottomColor: isDark ? "#262626" : "#dbdbdb" }}
      >
        <TouchableOpacity onPress={onClose}>
          <X size={24} color={isDark ? "#ffffff" : "#000000"} />
        </TouchableOpacity>
        <Text
          style={{ color: isDark ? "#ffffff" : "#000000" }}
          className="text-lg font-bold"
        >
          New Group
        </Text>
        <TouchableOpacity
          onPress={handleNext}
          disabled={selectedUsers.size === 0}
        >
          <Text
            className={`text-base font-semibold ${
              selectedUsers.size === 0
                ? isDark
                  ? "text-gray-600"
                  : "text-gray-400"
                : "text-blue-500"
            }`}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selected count */}
      {selectedUsers.size > 0 && (
        <View
          className={`px-4 py-2 border-b ${
            isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200"
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {selectedUsers.size} {selectedUsers.size === 1 ? "member" : "members"}{" "}
            selected
          </Text>
        </View>
      )}

      {/* Search bar */}
      <View
        className={`flex-row items-center px-4 py-3 mx-4 my-3 rounded-lg ${
          isDark ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <Search
          size={20}
          color={isDark ? "#9ca3af" : "#6b7280"}
          style={{ marginRight: 8 }}
        />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search users..."
          placeholderTextColor={isDark ? "#737373" : "#a1a1aa"}
          style={{ color: isDark ? "#ffffff" : "#000000" }}
          className="flex-1 text-base"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X size={18} color={isDark ? "#9ca3af" : "#6b7280"} />
          </TouchableOpacity>
        )}
      </View>

      {/* User list */}
      {isLoadingUsers ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : filteredUsers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text
            className={`text-base ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {searchQuery ? "No users found" : "No users available"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </>
  );

  const renderDetailsStep = () => (
    <>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-4 border-b"
        style={{ borderBottomColor: isDark ? "#262626" : "#dbdbdb" }}
      >
        <TouchableOpacity onPress={handleBack}>
          <Text className="text-blue-500 text-base">Back</Text>
        </TouchableOpacity>
        <Text
          style={{ color: isDark ? "#ffffff" : "#000000" }}
          className="text-lg font-bold"
        >
          Group Details
        </Text>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!groupName.trim() || isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <Text
              className={`text-base font-semibold ${
                !groupName.trim()
                  ? isDark
                    ? "text-gray-600"
                    : "text-gray-400"
                  : "text-blue-500"
              }`}
            >
              Create
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="px-4 py-6">
        {/* Group avatar */}
        <View className="items-center mb-6">
          <Pressable onPress={onPickImage ? handlePickImage : undefined}>
            <View>
              {groupAvatar ? (
                <Image
                  source={{ uri: groupAvatar }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                  }}
                />
              ) : (
                <View
                  style={{
                    backgroundColor: isDark ? "#262626" : "#f3f4f6",
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                  }}
                  className="items-center justify-center"
                >
                  <Text
                    style={{ color: isDark ? "#a1a1aa" : "#9ca3af" }}
                    className="text-4xl font-bold"
                  >
                    {groupName.charAt(0)?.toUpperCase() || "G"}
                  </Text>
                </View>
              )}
              {onPickImage && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "#3b82f6",
                    borderRadius: 15,
                    padding: 6,
                  }}
                >
                  <Camera size={16} color="#ffffff" />
                </View>
              )}
            </View>
          </Pressable>
          <Text
            style={{ color: isDark ? "#a1a1aa" : "#737373" }}
            className="text-sm mt-2"
          >
            {onPickImage ? "Tap to add group photo" : "Group photo"}
          </Text>
        </View>

        {/* Group name */}
        <View className="mb-4">
          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="text-sm font-semibold mb-2"
          >
            Group Name *
          </Text>
          <TextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Enter group name"
            placeholderTextColor={isDark ? "#737373" : "#a1a1aa"}
            style={{
              backgroundColor: isDark ? "#262626" : "#f3f4f6",
              color: isDark ? "#ffffff" : "#000000",
            }}
            className="p-3 rounded-lg text-base"
            maxLength={50}
          />
        </View>

        {/* Group description */}
        <View className="mb-4">
          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="text-sm font-semibold mb-2"
          >
            Description (Optional)
          </Text>
          <TextInput
            value={groupDescription}
            onChangeText={setGroupDescription}
            placeholder="What's this group about?"
            placeholderTextColor={isDark ? "#737373" : "#a1a1aa"}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: isDark ? "#262626" : "#f3f4f6",
              color: isDark ? "#ffffff" : "#000000",
              textAlignVertical: "top",
            }}
            className="p-3 rounded-lg text-base"
            maxLength={200}
          />
        </View>

        {/* Members summary */}
        <View>
          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="text-sm font-semibold mb-2"
          >
            Members
          </Text>
          <Text
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {selectedUsers.size + 1}{" "}
            {selectedUsers.size + 1 === 1 ? "member" : "members"} (including you)
          </Text>
        </View>
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View
          style={{
            backgroundColor: isDark ? "#000000" : "#ffffff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: height * 0.85,
          }}
        >
          {step === "select" ? renderSelectStep() : renderDetailsStep()}
        </View>
      </View>
    </Modal>
  );
}
