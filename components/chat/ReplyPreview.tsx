import { Message } from "@/services/api";
import { X } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

interface ReplyPreviewProps {
  message: Message;
  isDark: boolean;
  onClose: () => void;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({
  message,
  isDark,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      className={`mx-3 mb-2 rounded-lg overflow-hidden border-l-4 border-l-[#0088cc] ${isDark ? "bg-neutral-900" : "bg-white"}`}
      style={{ transform: [{ translateY: slideAnim }] }}
    >
      <View className="flex-row items-center py-2.5 px-3">
        <View className="flex-1">
          <Text className="text-[#0088cc] font-semibold text-[13px] mb-0.5">
            Replying to {message.senderTitle || "message"}
          </Text>
          <Text
            className={`text-sm ${isDark ? "text-neutral-500" : "text-neutral-600"}`}
            numberOfLines={1}
          >
            {message.type === "image"
              ? "📷 Photo"
              : message.type === "voice"
                ? "🎤 Voice message"
                : message.content}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={20} color={isDark ? "#666" : "#999"} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
