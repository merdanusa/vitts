import React from "react";
import {
  ActivityIndicator,
  Animated,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LoadingViewProps {
  isDark: boolean;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ isDark }) => (
  <SafeAreaView
    style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
    className="flex-1"
  >
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="small" color={isDark ? "#ffffff" : "#000000"} />
    </View>
  </SafeAreaView>
);

interface UploadIndicatorProps {
  isDark: boolean;
}

export const UploadIndicator: React.FC<UploadIndicatorProps> = ({ isDark }) => (
  <View
    style={{
      backgroundColor: isDark ? "#1a1a1a" : "#f3f4f6",
      paddingVertical: 12,
      paddingHorizontal: 16,
    }}
  >
    <View className="flex-row items-center">
      <ActivityIndicator size="small" color={isDark ? "#ffffff" : "#007AFF"} />
      <Text
        style={{ color: isDark ? "#ffffff" : "#000000" }}
        className="ml-3 text-base"
      >
        Uploading...
      </Text>
    </View>
  </View>
);

interface RecordingIndicatorProps {
  isDark: boolean;
  recordingAnimation: Animated.Value;
  onStop: () => void;
}

export const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
  isDark,
  recordingAnimation,
  onStop,
}) => (
  <View
    style={{
      backgroundColor: isDark ? "#1a1a1a" : "#f3f4f6",
      paddingVertical: 12,
      paddingHorizontal: 16,
    }}
  >
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <Animated.View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: "#ef4444",
            marginRight: 12,
            transform: [{ scale: recordingAnimation }],
          }}
        />
        <Text
          style={{ color: isDark ? "#ffffff" : "#000000" }}
          className="text-base font-medium"
        >
          Recording...
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={onStop}
        style={{
          backgroundColor: isDark ? "#262626" : "#e5e7eb",
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
        }}
      >
        <Text
          style={{ color: isDark ? "#ffffff" : "#000000" }}
          className="font-medium"
        >
          Send
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);
