import React from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LoadingViewProps {
  isDark: boolean;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ isDark }) => {
  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator
          size="small"
          color={isDark ? "#ffffff" : "#000000"}
        />
      </View>
    </SafeAreaView>
  );
};
