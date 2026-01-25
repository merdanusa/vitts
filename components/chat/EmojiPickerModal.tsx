import EMOJIS from "@/constants/emoji";
import { X } from "lucide-react-native";
import React from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";

interface EmojiPickerModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

export const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({
  visible,
  isDark,
  onClose,
  onSelect,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <View
          style={{
            backgroundColor: isDark ? "#000000" : "#ffffff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: Platform.OS === "ios" ? 34 : 20,
          }}
        >
          <View className="flex-row items-center justify-between px-4 py-4">
            <Text
              style={{ color: isDark ? "#ffffff" : "#000000" }}
              className="text-lg font-semibold"
            >
              Emoji
            </Text>
            <TouchableOpacity activeOpacity={0.6} onPress={onClose}>
              <X size={24} color={isDark ? "#ffffff" : "#000000"} />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              paddingHorizontal: 16,
              paddingBottom: 16,
            }}
          >
            {EMOJIS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                activeOpacity={0.6}
                onPress={() => onSelect(emoji)}
                style={{
                  width: "20%",
                  aspectRatio: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 32 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
