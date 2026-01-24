import { showIOSAlert } from "@/components/IOSAlertDialog";
import { Info, Share2, X } from "lucide-react-native";
import React from "react";
import {
  Animated,
  Clipboard,
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
  onShowAlert: (config: any) => void;
}

export function AvatarModal({
  visible,
  user,
  isDark,
  scaleAnim,
  onClose,
  onShowAlert,
}: AvatarModalProps) {
  const displayAvatar =
    user.avatar && user.avatar !== "M" && user.avatar !== "";

  const handleInfo = () => {
    const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    onShowAlert(
      showIOSAlert.multiOption(
        user.name,
        `@${user.login}\n\nMember since ${memberSince}`,
        [
          {
            text: "OK",
            style: "cancel",
          },
        ],
      ),
    );
  };

  const handleShare = () => {
    Clipboard.setString(`@${user.login}`);
    onShowAlert(
      showIOSAlert.simple("Copied", `@${user.login} copied to clipboard`),
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
      <View
        style={{
          flex: 1,
          backgroundColor: isDark
            ? "rgba(0, 0, 0, 0.95)"
            : "rgba(0, 0, 0, 0.9)",
        }}
      >
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute",
            top: 50,
            right: 20,
            zIndex: 10,
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.15)"
              : "rgba(255, 255, 255, 0.2)",
            borderRadius: 20,
            padding: 8,
          }}
          activeOpacity={0.7}
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
                    backgroundColor: isDark ? "#262626" : "#e5e7eb",
                    width: width * 0.9,
                    height: width * 0.9,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ color: isDark ? "#a1a1aa" : "#737373" }}
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
            paddingHorizontal: 40,
          }}
        >
          <View className="flex-row gap-4 justify-center">
            <TouchableOpacity
              onPress={handleInfo}
              style={{
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.15)"
                  : "rgba(255, 255, 255, 0.25)",
                borderRadius: 50,
                padding: 18,
                alignItems: "center",
                width: 80,
              }}
              activeOpacity={0.7}
            >
              <Info size={26} color="#ffffff" />
              <Text className="text-white text-xs mt-2 font-semibold">
                Info
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              style={{
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.15)"
                  : "rgba(255, 255, 255, 0.25)",
                borderRadius: 50,
                padding: 18,
                alignItems: "center",
                width: 80,
              }}
              activeOpacity={0.7}
            >
              <Share2 size={26} color="#ffffff" />
              <Text className="text-white text-xs mt-2 font-semibold">
                Share
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
