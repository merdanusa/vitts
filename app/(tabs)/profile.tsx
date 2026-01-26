import { AvatarModal } from "@/components/AvatarModal";
import { EditProfileModal } from "@/components/EditProfileModal";
import FriendSkeleton from "@/components/FriendSkeleton";
import { IOSAlert, showIOSAlert } from "@/components/IOSAlertDialog";
import { ProfileHeader } from "@/components/ProfileHeader";
import { getCurrentUser, updateProfile, uploadAvatar } from "@/services/api";
import { RootState } from "@/store";
import {
  updateAvatar as updateAvatarAction,
  updatePhoneNumber,
  updateUserProfile,
} from "@/store/userSlice";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Radio, Settings } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Clipboard,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const AVATAR_SIZE = 120;

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isDark = useSelector((state: RootState) => state.theme.isDark);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [alertConfig, setAlertConfig] = useState<any>(null);

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

      dispatch(
        updateUserProfile({
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          bio: data.bio,
          birthday: data.birthday,
        }),
      );
    } catch (err: any) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
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
      mediaTypes: ["images"],
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

  const handleSaveProfile = async (profileData: any) => {
    try {
      const updatedUser = await updateProfile(profileData);
      setUser(updatedUser);
      dispatch(
        updateUserProfile({
          name: updatedUser.name,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          bio: updatedUser.bio,
          birthday: updatedUser.birthday,
        }),
      );

      if (profileData.phoneNumber !== user.phoneNumber) {
        dispatch(updatePhoneNumber(updatedUser.phoneNumber));
      }

      return updatedUser;
    } catch (err: any) {
      throw err;
    }
  };

  const handleShare = () => {
    Clipboard.setString(`@${user.login}`);
    setAlertConfig(
      showIOSAlert.simple("Copied", `@${user.login} copied to clipboard`),
    );
  };

  const handleOpenSettings = () => {
    router.push("/settings");
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1 justify-center items-center"
      >
        <ActivityIndicator
          size="small"
          color={isDark ? "#ffffff" : "#000000"}
        />
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1 justify-center items-center"
      >
        <Text
          style={{ color: isDark ? "#ef4444" : "#dc2626" }}
          className="text-base"
        >
          {error || "No profile data"}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      <View
        style={{
          borderBottomWidth: 0.5,
          borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
          backgroundColor: isDark ? "#000000" : "#ffffff",
        }}
        className="flex-row items-center justify-between px-4 py-3"
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
          onPress={handleOpenSettings}
          className="p-2"
          activeOpacity={0.7}
        >
          <Settings size={22} color={isDark ? "#ffffff" : "#000000"} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          <ProfileHeader
            user={user}
            isDark={isDark}
            uploadingAvatar={uploadingAvatar}
            onAvatarLongPress={() => setAvatarModalVisible(true)}
            onEditPress={() => setEditModalVisible(true)}
            onSharePress={handleShare}
            avatarSize={AVATAR_SIZE}
          />

          <View
            style={{
              borderTopWidth: 0.5,
              borderTopColor: isDark ? "#1a1a1a" : "#f3f4f6",
              paddingTop: 20,
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-base font-semibold"
              >
                Suggested Friends
              </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-[#007AFF] text-sm font-semibold">
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
              borderTopWidth: 0.5,
              borderTopColor: isDark ? "#1a1a1a" : "#f3f4f6",
              paddingTop: 20,
              marginTop: 20,
            }}
          >
            <View className="items-center py-12">
              <View
                style={{
                  borderWidth: 2,
                  borderColor: isDark ? "#1a1a1a" : "#f3f4f6",
                }}
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
              >
                <Radio size={36} color={isDark ? "#737373" : "#a1a1aa"} />
              </View>
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-xl font-bold mb-2"
              >
                No VibeCasts Yet
              </Text>
              <Text
                style={{ color: isDark ? "#737373" : "#a1a1aa" }}
                className="text-sm text-center px-8"
              >
                When you create VibeCasts, they'll appear here.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <AvatarModal
        visible={avatarModalVisible}
        user={user}
        isDark={isDark}
        scaleAnim={scaleAnim}
        onClose={() => setAvatarModalVisible(false)}
        onShowAlert={setAlertConfig}
      />

      <EditProfileModal
        visible={editModalVisible}
        user={user}
        isDark={isDark}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveProfile}
        onPickImage={handlePickImage}
        onShowAlert={setAlertConfig}
      />

      {alertConfig && (
        <IOSAlert
          visible={true}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onDismiss={() => setAlertConfig(null)}
          isDark={isDark}
        />
      )}
    </SafeAreaView>
  );
}
