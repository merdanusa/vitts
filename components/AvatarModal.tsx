import { showIOSAlert } from "@/components/IOSAlertDialog";
import { Ban, Info, Share2, X } from "lucide-react-native";
import React from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface AvatarModalProps {
  visible: boolean;
  user: any;
  isDark: boolean;
  scaleAnim: Animated.Value;
  onClose: () => void;
  onShare: () => void;
  onShowAlert: (config: any) => void;
}

export function AvatarModal({
  visible,
  user,
  isDark,
  scaleAnim,
  onClose,
  onShare,
  onShowAlert,
}: AvatarModalProps) {
  const displayAvatar =
    user.avatar && user.avatar !== "M" && user.avatar !== "";

  const handleInfo = () => {
    onShowAlert(
      showIOSAlert.simple(
        "Profile Info",
        `Name: ${user.name}\nUsername: @${user.login}\nMember since: ${new Date(user.createdAt).toLocaleDateString()}`,
      ),
    );
    onClose();
  };

  const handleBlock = () => {
    onShowAlert(
      showIOSAlert.destructive(
        "Block User",
        "Are you sure you want to block this user? They won't be able to see your profile or contact you.",
        "Block",
        () => {
          console.log("User blocked");
          onClose();
        },
      ),
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.95)" }}>
        <TouchableOpacity
          onPress={onClose}
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

        <Pressable style={{ flex: 1 }} onPress={onClose}>
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
              onPress={onShare}
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
  );
}
