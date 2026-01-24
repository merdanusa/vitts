import { showIOSAlert } from "@/components/IOSAlertDialog";
import { Camera } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DatePickerModal } from "./DatePickerModal";

const { height } = Dimensions.get("window");

interface EditProfileModalProps {
  visible: boolean;
  user: any;
  isDark: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<any>;
  onPickImage: () => void;
  onShowAlert: (config: any) => void;
}

export function EditProfileModal({
  visible,
  user,
  isDark,
  onClose,
  onSave,
  onPickImage,
  onShowAlert,
}: EditProfileModalProps) {
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBirthday, setEditBirthday] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    if (visible && user) {
      setEditName(user.name || "");
      setEditBio(user.bio || "");
      setEditEmail(user.email || "");
      setEditBirthday(user.birthday || "");
    }
  }, [visible, user]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave({
        name: editName,
        bio: editBio,
        email: editEmail || undefined,
        birthday: editBirthday || undefined,
      });

      onShowAlert(
        showIOSAlert.simple(
          "Success",
          "Profile updated successfully!",
          onClose,
        ),
      );
    } catch (err: any) {
      onShowAlert(
        showIOSAlert.simple(
          "Error",
          err.response?.data?.message || "Failed to update profile",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const displayAvatar =
    user?.avatar && user.avatar !== "M" && user.avatar !== "";

  return (
    <>
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
            <View
              className="flex-row items-center justify-between px-4 py-4 border-b"
              style={{ borderBottomColor: isDark ? "#262626" : "#dbdbdb" }}
            >
              <TouchableOpacity onPress={onClose}>
                <Text className="text-blue-500 text-base">Cancel</Text>
              </TouchableOpacity>
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-lg font-bold"
              >
                Edit Profile
              </Text>
              <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator size="small" color="#3b82f6" />
                ) : (
                  <Text className="text-blue-500 text-base font-semibold">
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView className="px-4 py-4">
              <View className="items-center mb-6">
                <Pressable onPress={onPickImage}>
                  <View>
                    {displayAvatar ? (
                      <Image
                        source={{ uri: user.avatar }}
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
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </Text>
                      </View>
                    )}
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
                  </View>
                </Pressable>
                <Text
                  style={{ color: isDark ? "#a1a1aa" : "#737373" }}
                  className="text-sm mt-2"
                >
                  Tap to change avatar
                </Text>
              </View>

              <View className="mb-4">
                <Text
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="text-sm font-semibold mb-2"
                >
                  Name
                </Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor={isDark ? "#737373" : "#a1a1aa"}
                  style={{
                    backgroundColor: isDark ? "#262626" : "#f3f4f6",
                    color: isDark ? "#ffffff" : "#000000",
                  }}
                  className="p-3 rounded-lg text-base"
                />
              </View>

              <View className="mb-4">
                <Text
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="text-sm font-semibold mb-2"
                >
                  Bio
                </Text>
                <TextInput
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={isDark ? "#737373" : "#a1a1aa"}
                  multiline
                  numberOfLines={4}
                  style={{
                    backgroundColor: isDark ? "#262626" : "#f3f4f6",
                    color: isDark ? "#ffffff" : "#000000",
                    textAlignVertical: "top",
                  }}
                  className="p-3 rounded-lg text-base"
                />
              </View>

              <View className="mb-4">
                <Text
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="text-sm font-semibold mb-2"
                >
                  Email
                </Text>
                <TextInput
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="email@example.com"
                  placeholderTextColor={isDark ? "#737373" : "#a1a1aa"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    backgroundColor: isDark ? "#262626" : "#f3f4f6",
                    color: isDark ? "#ffffff" : "#000000",
                  }}
                  className="p-3 rounded-lg text-base"
                />
              </View>

              <View className="mb-6">
                <Text
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="text-sm font-semibold mb-2"
                >
                  Birthday
                </Text>
                <TouchableOpacity
                  onPress={() => setDatePickerVisible(true)}
                  style={{
                    backgroundColor: isDark ? "#262626" : "#f3f4f6",
                  }}
                  className="p-3 rounded-lg"
                >
                  <Text
                    style={{
                      color: editBirthday
                        ? isDark
                          ? "#ffffff"
                          : "#000000"
                        : isDark
                          ? "#737373"
                          : "#a1a1aa",
                    }}
                    className="text-base"
                  >
                    {editBirthday || "YYYY-MM-DD"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DatePickerModal
        visible={datePickerVisible}
        isDark={isDark}
        initialDate={editBirthday}
        onClose={() => setDatePickerVisible(false)}
        onConfirm={(date: any) => {
          setEditBirthday(date);
          setDatePickerVisible(false);
        }}
      />
    </>
  );
}
