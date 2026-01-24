import FriendSkeleton from "@/components/FriendSkeleton";
import { IOSAlert, showIOSAlert } from "@/components/IOSAlertDialog";
import {
  logout as apiLogout,
  getCurrentUser,
  updateProfile,
  uploadAvatar,
} from "@/services/api";
import { RootState } from "@/store";
import { setThemeMode } from "@/store/themeSlice";
import {
  logout as logoutAction,
  updateAvatar as updateAvatarAction,
  updateUserProfile,
} from "@/store/userSlice";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Ban,
  Camera,
  Info,
  Monitor,
  Moon,
  Radio,
  Settings,
  Share2,
  Sun,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const { width, height } = Dimensions.get("window");
const AVATAR_SIZE = 120;

type ThemeMode = "light" | "dark" | "system";

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const currentThemeMode = useSelector((state: RootState) => state.theme.mode);
  const userFromRedux = useSelector((state: RootState) => state.user);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBirthday, setEditBirthday] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [alertConfig, setAlertConfig] = useState<any>(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (avatarModalVisible) {
      scaleAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }).start();
    }
  }, [avatarModalVisible]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentUser();
      setUser(data);
      setEditName(data.name || "");
      setEditBio(data.bio || "");
      setEditEmail(data.email || "");
      setEditBirthday(data.birthday || "");
    } catch (err: any) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAlertConfig(
      showIOSAlert.destructive(
        "Logout",
        "Are you sure you want to logout?",
        "Logout",
        async () => {
          await apiLogout();
          dispatch(logoutAction());
          router.replace("/auth");
        },
      ),
    );
  };

  const handleThemeChange = (mode: ThemeMode) => {
    dispatch(setThemeMode(mode));
  };

  const openAvatarModal = () => {
    setAvatarModalVisible(true);
  };

  const closeAvatarModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setAvatarModalVisible(false);
    });
  };

  const openEditModal = () => {
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const updatedUser = await updateProfile({
        name: editName,
        bio: editBio,
        email: editEmail || undefined,
        birthday: editBirthday || undefined,
      });

      setUser(updatedUser);

      dispatch(
        updateUserProfile({
          name: updatedUser.name,
          email: updatedUser.email,
        }),
      );

      setAlertConfig(
        showIOSAlert.simple("Success", "Profile updated successfully!", () =>
          closeEditModal(),
        ),
      );
    } catch (err: any) {
      setAlertConfig(
        showIOSAlert.simple(
          "Error",
          err.response?.data?.message || "Failed to update profile",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setAlertConfig(
        showIOSAlert.simple(
          "Permission Needed",
          "Please grant camera roll permission to change your avatar.",
        ),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleUploadAvatar(result.assets[0]);
    }
  };

  const handleUploadAvatar = async (asset: any) => {
    try {
      setUploadingAvatar(true);
      const file = {
        uri: asset.uri,
        fileName: asset.fileName || `avatar-${Date.now()}.jpg`,
        mimeType: asset.mimeType || "image/jpeg",
      };

      const response = await uploadAvatar(file, (progress) => {
        console.log("Upload progress:", progress);
      });

      setUser({ ...user, avatar: response.avatar });
      dispatch(updateAvatarAction(response.avatar));

      setAlertConfig(
        showIOSAlert.simple("Success", "Avatar updated successfully!"),
      );
    } catch (err: any) {
      setAlertConfig(
        showIOSAlert.simple(
          "Error",
          err.response?.data?.message || "Failed to upload avatar",
        ),
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleShare = () => {
    setAlertConfig(
      showIOSAlert.multiOption(
        "Share Profile",
        "Choose how you'd like to share your profile",
        [
          {
            text: "Copy Link",
            onPress: () => console.log("Copy link"),
            style: "default",
          },
          {
            text: "Share via...",
            onPress: () => console.log("Share via"),
            style: "default",
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      ),
    );
    closeAvatarModal();
  };

  const handleInfo = () => {
    setAlertConfig(
      showIOSAlert.simple(
        "Profile Info",
        `Name: ${user.name}\nUsername: @${user.login}\nMember since: ${new Date(user.createdAt).toLocaleDateString()}`,
      ),
    );
    closeAvatarModal();
  };

  const handleBlock = () => {
    setAlertConfig(
      showIOSAlert.destructive(
        "Block User",
        "Are you sure you want to block this user? They won't be able to see your profile or contact you.",
        "Block",
        () => {
          console.log("User blocked");
          closeAvatarModal();
        },
      ),
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1 justify-center items-center"
      >
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1 justify-center items-center"
      >
        <Text className="text-red-500 text-base">
          {error || "No profile data"}
        </Text>
      </SafeAreaView>
    );
  }

  const displayAvatar =
    user.avatar && user.avatar !== "M" && user.avatar !== "";

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      <View
        style={{
          borderBottomColor: isDark ? "#262626" : "#dbdbdb",
          backgroundColor: isDark ? "#000000" : "#ffffff",
        }}
        className="flex-row items-center justify-between px-4 py-3 border-b"
      >
        <View className="flex-1">
          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="text-xl font-bold"
          >
            {user.login}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setSettingsModalVisible(true)}
          className="p-2"
        >
          <Settings size={24} color={isDark ? "#ffffff" : "#000000"} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          <View className="items-center mb-6">
            <Pressable onLongPress={openAvatarModal} delayLongPress={300}>
              <View>
                {displayAvatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={{
                      width: AVATAR_SIZE,
                      height: AVATAR_SIZE,
                      borderRadius: AVATAR_SIZE / 2,
                      marginBottom: 16,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      backgroundColor: isDark ? "#262626" : "#f3f4f6",
                      width: AVATAR_SIZE,
                      height: AVATAR_SIZE,
                      borderRadius: AVATAR_SIZE / 2,
                      marginBottom: 16,
                    }}
                    className="items-center justify-center"
                  >
                    <Text
                      style={{ color: isDark ? "#a1a1aa" : "#9ca3af" }}
                      className="text-5xl font-bold"
                    >
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </Text>
                  </View>
                )}
                {uploadingAvatar && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 16,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      borderRadius: AVATAR_SIZE / 2,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator size="large" color="#ffffff" />
                  </View>
                )}
              </View>
            </Pressable>

            <Text
              style={{ color: isDark ? "#ffffff" : "#000000" }}
              className="text-xl font-bold mb-1"
            >
              {user.name}
            </Text>
            <Text
              style={{ color: isDark ? "#a1a1aa" : "#737373" }}
              className="text-sm mb-1"
            >
              @{user.login}
            </Text>
            {user.bio && user.bio !== "Hey there! I use this app." && (
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-sm text-center mt-2 px-8"
              >
                {user.bio}
              </Text>
            )}
          </View>

          <View className="flex-row gap-2 mb-6">
            <TouchableOpacity
              onPress={openEditModal}
              style={{
                backgroundColor: isDark ? "#262626" : "#efefef",
              }}
              className="flex-1 py-2.5 rounded-lg items-center"
            >
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-sm font-semibold"
              >
                Edit Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              style={{
                backgroundColor: isDark ? "#262626" : "#efefef",
              }}
              className="flex-1 py-2.5 rounded-lg flex-row items-center justify-center gap-2"
            >
              <Share2 size={16} color={isDark ? "#ffffff" : "#000000"} />
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-sm font-semibold"
              >
                Share
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              borderTopColor: isDark ? "#262626" : "#dbdbdb",
              paddingTop: 20,
            }}
            className="border-t"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-base font-semibold"
              >
                Suggested Friends
              </Text>
              <TouchableOpacity>
                <Text className="text-blue-500 text-sm font-semibold">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            <FriendSkeleton isDark={isDark} />
            <FriendSkeleton isDark={isDark} />
            <FriendSkeleton isDark={isDark} />
          </View>

          <View
            style={{
              borderTopColor: isDark ? "#262626" : "#dbdbdb",
              paddingTop: 20,
              marginTop: 20,
            }}
            className="border-t"
          >
            <View className="items-center py-12">
              <View
                style={{
                  borderColor: isDark ? "#262626" : "#dbdbdb",
                }}
                className="w-20 h-20 rounded-full border-2 items-center justify-center mb-4"
              >
                <Radio size={36} color={isDark ? "#a1a1aa" : "#737373"} />
              </View>
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-xl font-bold mb-2"
              >
                No VibeCasts Yet
              </Text>
              <Text
                style={{ color: isDark ? "#a1a1aa" : "#737373" }}
                className="text-sm text-center px-8"
              >
                When you create VibeCasts, they'll appear here.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={avatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeAvatarModal}
        statusBarTranslucent
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.95)" }}>
          <TouchableOpacity
            onPress={closeAvatarModal}
            style={{
              position: "absolute",
              top: 50,
              right: 20,
              zIndex: 10,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 20,
              padding: 8,
            }}
          >
            <X size={24} color="#ffffff" />
          </TouchableOpacity>

          <Pressable style={{ flex: 1 }} onPress={closeAvatarModal}>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Animated.View
                style={{
                  transform: [{ scale: scaleAnim }],
                }}
              >
                {displayAvatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={{
                      width: width * 0.9,
                      height: width * 0.9,
                      borderRadius: 12,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      backgroundColor: isDark ? "#262626" : "#f3f4f6",
                      width: width * 0.9,
                      height: width * 0.9,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{ color: isDark ? "#a1a1aa" : "#9ca3af" }}
                      className="text-8xl font-bold"
                    >
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </Text>
                  </View>
                )}
              </Animated.View>
            </View>
          </Pressable>

          <View
            style={{
              position: "absolute",
              bottom: 40,
              left: 0,
              right: 0,
              paddingHorizontal: 20,
            }}
          >
            <View className="flex-row gap-3 justify-center">
              <TouchableOpacity
                onPress={handleShare}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: 50,
                  padding: 16,
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Share2 size={24} color="#ffffff" />
                <Text className="text-white text-xs mt-2 font-semibold">
                  Share
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleInfo}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: 50,
                  padding: 16,
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Info size={24} color="#ffffff" />
                <Text className="text-white text-xs mt-2 font-semibold">
                  Info
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBlock}
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.25)",
                  borderRadius: 50,
                  padding: 16,
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Ban size={24} color="#ef4444" />
                <Text className="text-red-500 text-xs mt-2 font-semibold">
                  Block
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={settingsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setSettingsModalVisible(false)}
          />
          <View
            style={{
              backgroundColor: isDark ? "#000000" : "#ffffff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: 40,
            }}
          >
            <View
              className="px-4 py-4 border-b"
              style={{ borderBottomColor: isDark ? "#262626" : "#dbdbdb" }}
            >
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-xl font-bold"
              >
                Settings
              </Text>
            </View>

            <View className="px-4 py-4">
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-base font-semibold mb-3"
              >
                Theme
              </Text>

              <TouchableOpacity
                onPress={() => handleThemeChange("light")}
                style={{
                  backgroundColor:
                    currentThemeMode === "light"
                      ? "#3b82f6"
                      : isDark
                        ? "#262626"
                        : "#f3f4f6",
                  marginBottom: 8,
                }}
                className="flex-row items-center p-4 rounded-lg"
              >
                <Sun
                  size={20}
                  color={
                    currentThemeMode === "light"
                      ? "#ffffff"
                      : isDark
                        ? "#a1a1aa"
                        : "#737373"
                  }
                />
                <Text
                  style={{
                    color:
                      currentThemeMode === "light"
                        ? "#ffffff"
                        : isDark
                          ? "#ffffff"
                          : "#000000",
                  }}
                  className="ml-3 text-base font-medium"
                >
                  Light
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleThemeChange("dark")}
                style={{
                  backgroundColor:
                    currentThemeMode === "dark"
                      ? "#3b82f6"
                      : isDark
                        ? "#262626"
                        : "#f3f4f6",
                  marginBottom: 8,
                }}
                className="flex-row items-center p-4 rounded-lg"
              >
                <Moon
                  size={20}
                  color={
                    currentThemeMode === "dark"
                      ? "#ffffff"
                      : isDark
                        ? "#a1a1aa"
                        : "#737373"
                  }
                />
                <Text
                  style={{
                    color:
                      currentThemeMode === "dark"
                        ? "#ffffff"
                        : isDark
                          ? "#ffffff"
                          : "#000000",
                  }}
                  className="ml-3 text-base font-medium"
                >
                  Dark
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleThemeChange("system")}
                style={{
                  backgroundColor:
                    currentThemeMode === "system"
                      ? "#3b82f6"
                      : isDark
                        ? "#262626"
                        : "#f3f4f6",
                  marginBottom: 8,
                }}
                className="flex-row items-center p-4 rounded-lg"
              >
                <Monitor
                  size={20}
                  color={
                    currentThemeMode === "system"
                      ? "#ffffff"
                      : isDark
                        ? "#a1a1aa"
                        : "#737373"
                  }
                />
                <Text
                  style={{
                    color:
                      currentThemeMode === "system"
                        ? "#ffffff"
                        : isDark
                          ? "#ffffff"
                          : "#000000",
                  }}
                  className="ml-3 text-base font-medium"
                >
                  System
                </Text>
              </TouchableOpacity>
            </View>

            <View className="px-4 mt-4">
              <TouchableOpacity
                onPress={handleLogout}
                style={{ backgroundColor: "#ef4444" }}
                className="p-4 rounded-lg items-center"
              >
                <Text className="text-white text-base font-semibold">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <Pressable style={{ flex: 1 }} onPress={closeEditModal} />
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
              <TouchableOpacity onPress={closeEditModal}>
                <Text className="text-blue-500 text-base">Cancel</Text>
              </TouchableOpacity>
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-lg font-bold"
              >
                Edit Profile
              </Text>
              <TouchableOpacity onPress={handleSaveProfile} disabled={isSaving}>
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
                <Pressable onPress={handlePickImage}>
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
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
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
                <TextInput
                  value={editBirthday}
                  onChangeText={setEditBirthday}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={isDark ? "#737373" : "#a1a1aa"}
                  style={{
                    backgroundColor: isDark ? "#262626" : "#f3f4f6",
                    color: isDark ? "#ffffff" : "#000000",
                  }}
                  className="p-3 rounded-lg text-base"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {alertConfig && (
        <IOSAlert
          visible={true}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onDismiss={() => setAlertConfig(null)}
        />
      )}
    </SafeAreaView>
  );
}
