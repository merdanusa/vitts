import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface UploadIndicatorProps {
  isDark: boolean;
}

export const UploadIndicator: React.FC<UploadIndicatorProps> = ({ isDark }) => {
  return (
    <View
      style={{
        backgroundColor: isDark ? "#1a1a1a" : "#f3f4f6",
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
    >
      <View className="flex-row items-center">
        <ActivityIndicator
          size="small"
          color={isDark ? "#ffffff" : "#007AFF"}
        />
        <Text
          style={{ color: isDark ? "#ffffff" : "#000000" }}
          className="ml-3 text-base"
        >
          Uploading...
        </Text>
      </View>
    </View>
  );
};
