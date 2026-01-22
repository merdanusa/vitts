import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  getCurrentUser,
  logout,
  uploadAvatar,
  UserProfile,
} from "@/services/api";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileScreen = ({ route, navigation }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadUserProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await getCurrentUser();
      setUser(profile);
    } catch (error) {
      console.error("Failed to load profile:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos",
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
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleUploadAvatar = async (asset: any) => {
    try {
      setUploading(true);

      const file = {
        uri: asset.uri,
        fileName: asset.fileName || `avatar-${Date.now()}.jpg`,
        mimeType: asset.mimeType || "image/jpeg",
      };

      const response = await uploadAvatar(file, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1),
        );
        console.log("Upload progress:", percentCompleted);
      });

      setUser((prev) => (prev ? { ...prev, avatar: response.avatar } : null));
      Alert.alert("Success", "Avatar updated successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to upload avatar",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.error("Logout error:", error);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>Failed to load profile</Text>
          <Button mt="$4" onPress={loadUserProfile}>
            <Text>Retry</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <VStack space="md" alignItems="center" px="$6" pt="$8" pb="$4">
          <TouchableOpacity onPress={handlePickImage} disabled={uploading}>
            <View style={styles.avatarContainer}>
              {user.avatar && user.avatar !== "default-avatar-url.jpg" ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>
                    {user.name[0].toUpperCase()}
                  </Text>
                </View>
              )}
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
              <View style={styles.cameraButton}>
                <Text style={styles.cameraEmoji}>📷</Text>
              </View>
            </View>
          </TouchableOpacity>

          <VStack alignItems="center" space="xs" mt="$2">
            <Text fontSize="$2xl" fontWeight="$bold">
              {user.name}
            </Text>
            <Text color="$gray500">@{user.login}</Text>
            {user.email && (
              <Text color="$gray400" fontSize="$sm">
                {user.email}
              </Text>
            )}
          </VStack>

          <HStack
            space="md"
            mt="$4"
            px="$4"
            py="$3"
            bg="$gray100"
            borderRadius="$lg"
            width="$full"
            justifyContent="space-around"
          >
            <VStack alignItems="center">
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: user.isOnline ? "#34C759" : "#8E8E93" },
                ]}
              />
              <Text fontSize="$xs" color="$gray500" mt="$1">
                {user.isOnline ? "Online" : "Offline"}
              </Text>
            </VStack>
            <VStack alignItems="center">
              <Text fontWeight="$semibold">
                {new Date(user.createdAt).getFullYear()}
              </Text>
              <Text fontSize="$xs" color="$gray500">
                Joined
              </Text>
            </VStack>
          </HStack>

          <Button
            mt="$6"
            width="$full"
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text color="white" fontWeight="$semibold">
              Edit Profile
            </Text>
          </Button>
          <Button
            variant="outline"
            width="$full"
            onPress={() => navigation.navigate("Settings")}
          >
            <Text fontWeight="$semibold">Privacy Settings</Text>
          </Button>
        </VStack>

        <View style={styles.infoSection}>
          <VStack space="md">
            <VStack space="xs">
              <Text fontSize="$xs" color="$gray500" fontWeight="$medium">
                BIO
              </Text>
              <Text>{user.bio || "No bio added yet"}</Text>
            </VStack>

            {user.birthday && (
              <VStack space="xs">
                <Text fontSize="$xs" color="$gray500" fontWeight="$medium">
                  BIRTHDAY
                </Text>
                <Text>{formatDate(user.birthday)}</Text>
              </VStack>
            )}

            <VStack space="xs">
              <Text fontSize="$xs" color="$gray500" fontWeight="$medium">
                MEMBER SINCE
              </Text>
              <Text>{formatDate(user.createdAt)}</Text>
            </VStack>
          </VStack>
        </View>

        <View style={styles.logoutSection}>
          <Button
            colorScheme="danger"
            variant="outline"
            onPress={handleLogout}
            width="$full"
          >
            <Text color="$red500" fontWeight="$semibold">
              Logout
            </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 48,
    color: "#fff",
    fontWeight: "bold",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  cameraEmoji: {
    color: "#fff",
    fontSize: 20,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: "#E5E5E5",
    marginTop: 8,
  },
  logoutSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
});

export default ProfileScreen;
