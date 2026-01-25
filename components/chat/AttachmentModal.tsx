import { Image as ImageIcon, Paperclip, X } from "lucide-react-native";
import React from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";

interface AttachmentModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onImagePick: () => void;
  onCameraPick: () => void;
  onDocumentPick: () => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  visible,
  isDark,
  onClose,
  onImagePick,
  onCameraPick,
  onDocumentPick,
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
              Send Attachment
            </Text>
            <TouchableOpacity activeOpacity={0.6} onPress={onClose}>
              <X size={24} color={isDark ? "#ffffff" : "#000000"} />
            </TouchableOpacity>
          </View>
          <View className="px-4 pb-4">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onImagePick}
              style={{
                backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
              className="flex-row items-center"
            >
              <View
                style={{
                  backgroundColor: "#007AFF",
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                }}
                className="items-center justify-center mr-3"
              >
                <ImageIcon size={20} color="#ffffff" />
              </View>
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-base font-medium"
              >
                Photo from Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCameraPick}
              style={{
                backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
              className="flex-row items-center"
            >
              <View
                style={{
                  backgroundColor: "#10b981",
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                }}
                className="items-center justify-center mr-3"
              >
                <ImageIcon size={20} color="#ffffff" />
              </View>
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-base font-medium"
              >
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onDocumentPick}
              style={{
                backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
                borderRadius: 12,
                padding: 16,
              }}
              className="flex-row items-center"
            >
              <View
                style={{
                  backgroundColor: "#f59e0b",
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                }}
                className="items-center justify-center mr-3"
              >
                <Paperclip size={20} color="#ffffff" />
              </View>
              <Text
                style={{ color: isDark ? "#ffffff" : "#000000" }}
                className="text-base font-medium"
              >
                Document
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
