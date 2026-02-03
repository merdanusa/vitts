import React from "react";
import { Text, View } from "react-native";

interface DateHeaderProps {
  label: string;
  isDark: boolean;
}

export const DateHeader: React.FC<DateHeaderProps> = ({ label, isDark }) => {
  return (
    <View
      style={{
        alignItems: "center",
        marginVertical: 16,
      }}
    >
      <View
        style={{
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.05)",
          paddingHorizontal: 16,
          paddingVertical: 6,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            color: isDark ? "#a3a3a3" : "#71717a",
            fontSize: 12,
            fontWeight: "600",
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
};
