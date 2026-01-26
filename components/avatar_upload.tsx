import { Image } from "@/components/ui/image";
import { uploadAvatar } from "@/services/api";
import { RootState } from "@/store";
import * as ImagePicker from "expo-image-picker";
import { Camera, Upload, X } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

interface AvatarUploadScreenProps {
  onComplete: () => void;
  userName: string;
}

export default function AvatarUploadScreen({
  onComplete,
  userName,
}: AvatarUploadScreenProps) {
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need camera roll permissions to upload your avatar.",
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need camera permissions to take a photo.",
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const filename = selectedImage.split("/").pop() || "avatar.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      const file = {
        uri: selectedImage,
        name: filename,
        type,
      };

      await uploadAvatar(file, (progressEvent) => {
        const progress = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        setUploadProgress(progress);
      });

      Alert.alert("Success!", "Profile picture uploaded successfully", [
        { text: "Continue", onPress: onComplete },
      ]);
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert(
        "Upload Failed",
        error.response?.data?.message ||
          "Failed to upload avatar. Please try again.",
      );
      setUploading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip Profile Picture?",
      "You can always add a profile picture later in your settings.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Skip", onPress: onComplete, style: "destructive" },
      ],
    );
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="items-center pt-12 pb-8">
          <Image
            source={require("@/assets/images/app_icon.png")}
            className="w-16 h-16 mb-8"
            alt="logo"
          />
          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="text-2xl font-bold text-center mb-2"
          >
            Add Profile Picture
          </Text>
          <Text
            style={{ color: isDark ? "#a1a1aa" : "#6b7280" }}
            className="text-sm text-center px-8"
          >
            Welcome, {userName}! Add a profile picture so your friends can
            recognize you.
          </Text>
        </View>

        {/* Avatar Preview */}
        <View className="items-center py-8">
          <View className="relative">
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                className="w-40 h-40 rounded-full"
                alt="avatar"
              />
            ) : (
              <View
                style={{
                  backgroundColor: isDark ? "#18181b" : "#f3f4f6",
                }}
                className="w-40 h-40 rounded-full items-center justify-center"
              >
                <Text
                  style={{ color: isDark ? "#52525b" : "#9ca3af" }}
                  className="text-6xl"
                >
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {selectedImage && !uploading && (
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                className="absolute top-0 right-0 w-10 h-10 rounded-full bg-red-500 items-center justify-center"
                activeOpacity={0.7}
              >
                <X size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {uploading && (
            <View className="mt-4 w-full px-8">
              <View
                style={{
                  backgroundColor: isDark ? "#27272a" : "#e5e7eb",
                }}
                className="h-2 rounded-full overflow-hidden"
              >
                <View
                  className="h-full bg-blue-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </View>
              <Text className="text-blue-500 text-sm text-center mt-2">
                Uploading... {uploadProgress}%
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {!uploading && (
          <View className="gap-3 mt-4">
            {!selectedImage ? (
              <>
                <TouchableOpacity
                  onPress={takePhoto}
                  activeOpacity={0.7}
                  className="bg-blue-500 h-12 rounded-lg flex-row items-center justify-center"
                >
                  <Camera size={20} color="white" />
                  <Text className="text-white font-bold text-sm ml-2">
                    Take Photo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={pickImage}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: isDark ? "#18181b" : "#ffffff",
                    borderColor: "#3b82f6",
                  }}
                  className="border-2 h-12 rounded-lg flex-row items-center justify-center"
                >
                  <Upload size={20} color="#3b82f6" />
                  <Text className="text-blue-500 font-bold text-sm ml-2">
                    Choose from Gallery
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={handleUpload}
                activeOpacity={0.7}
                className="bg-blue-500 h-12 rounded-lg items-center justify-center"
              >
                <Text className="text-white font-bold text-sm">
                  Upload Photo
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Skip Button */}
        <View className="mt-auto pb-6">
          <TouchableOpacity
            onPress={handleSkip}
            disabled={uploading}
            className="py-4"
            activeOpacity={0.7}
          >
            <Text className="text-blue-500 text-sm text-center font-semibold">
              {uploading ? "Uploading..." : "Skip for Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
