import { AvatarModal } from "@/components/AvatarModal";
import { EditProfileModal } from "@/components/EditProfileModal";
import { IOSAlert, showIOSAlert } from "@/components/IOSAlertDialog";
import { ProfileHeader } from "@/components/ProfileHeader";
import { WillCard } from "@/components/WillCard";
import {
  getCurrentUser,
  getWillsByAuthor,
  likeWill,
  unlikeWill,
  updateProfile,
  uploadAvatar,
  Will,
} from "@/services/api";
import { RootState } from "@/store";
import {
  updateAvatar as updateAvatarAction,
  updatePhoneNumber,
  updateUserProfile,
} from "@/store/userSlice";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Plus, Settings } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Clipboard,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const AVATAR_SIZE = 80;

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isDark = useSelector((state: RootState) => state.theme.isDark);

  const [user, setUser] = useState<any>(null);
  const [wills, setWills] = useState<Will[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [alertConfig, setAlertConfig] = useState<any>(null);
  const [likedWills, setLikedWills] = useState<Set<string>>(new Set());

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

      const userWillsResponse = await getWillsByAuthor(data.id);
      setWills(userWillsResponse.data);
    } catch (err: any) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

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

  const handleLike = async (willId: string) => {
    const isLiked = likedWills.has(willId);

    setLikedWills((prev) => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(willId);
      } else {
        newSet.add(willId);
      }
      return newSet;
    });

    setWills((prev) =>
      prev.map((will) =>
        will.id === willId
          ? {
              ...will,
              likesCount: isLiked ? will.likesCount - 1 : will.likesCount + 1,
            }
          : will,
      ),
    );

    try {
      if (isLiked) {
        await unlikeWill(willId);
      } else {
        await likeWill(willId);
      }
    } catch (error) {
      setLikedWills((prev) => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(willId);
        } else {
          newSet.delete(willId);
        }
        return newSet;
      });

      setWills((prev) =>
        prev.map((will) =>
          will.id === willId
            ? {
                ...will,
                likesCount: isLiked ? will.likesCount + 1 : will.likesCount - 1,
              }
            : will,
        ),
      );
    }
  };

  const handleEditWill = (willId: string) => {
    router.push(`/wills/manage?id=${willId}`);
  };

  const renderWillItem = ({ item }: { item: Will }) => (
    <WillCard
      item={item}
      isDark={isDark}
      isLiked={likedWills.has(item.id)}
      onLike={handleLike}
      showEdit={true}
      onEdit={handleEditWill}
      hideAuthor={true}
    />
  );

  const renderHeader = () => (
    <View>
      <View
        style={{
          borderBottomWidth: 0.5,
          borderBottomColor: isDark ? "#2c2c2e" : "#e5e7eb",
          backgroundColor: isDark ? "#000000" : "#ffffff",
        }}
        className="flex-row items-center justify-between px-4 py-3"
      >
        <View className="flex-1">
          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="text-xl font-bold"
          >
            {user?.login}
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

      <View className="px-4 py-4">
        <ProfileHeader
          user={user}
          isDark={isDark}
          uploadingAvatar={uploadingAvatar}
          onAvatarLongPress={() => setAvatarModalVisible(true)}
          onEditPress={() => setEditModalVisible(true)}
          onSharePress={handleShare}
          avatarSize={AVATAR_SIZE}
        />
      </View>

      <View
        style={{
          borderTopWidth: 0.5,
          borderBottomWidth: 0.5,
          borderColor: isDark ? "#2c2c2e" : "#e5e7eb",
          backgroundColor: isDark ? "#000000" : "#ffffff",
        }}
        className="px-4 py-3"
      >
        <Text
          style={{ color: isDark ? "#ffffff" : "#000000" }}
          className="text-base font-semibold"
        >
          Wills
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View className="items-center justify-center py-20 px-4">
      <Text
        style={{ color: isDark ? "#8e8e93" : "#9ca3af" }}
        className="text-center text-base mb-2"
      >
        No wills yet
      </Text>
      <Text
        style={{ color: isDark ? "#8e8e93" : "#9ca3af" }}
        className="text-center text-sm"
      >
        Share your first will
      </Text>
    </View>
  );

  if (loading && !user) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1 justify-center items-center"
      >
        <ActivityIndicator size="small" color="#007AFF" />
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
      <FlatList
        data={wills}
        renderItem={renderWillItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        onPress={() => router.push("/wills/manage")}
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          backgroundColor: "#007AFF",
          borderRadius: 28,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        className="items-center justify-center"
        activeOpacity={0.8}
      >
        <Plus size={28} color="#ffffff" />
      </TouchableOpacity>

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
