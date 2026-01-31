import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";

interface UploadIndicatorProps {
  isDark: boolean;
}

export const UploadIndicator: React.FC<UploadIndicatorProps> = ({ isDark }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => {
      progress.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, []);

  return (
    <Animated.View
      className={`px-4 py-3 ${isDark ? "bg-neutral-900" : "bg-neutral-100"}`}
      style={{ transform: [{ translateY: slideAnim }] }}
    >
      <View className="flex-row items-center">
        <Animated.View
          className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isDark ? "bg-blue-500/20" : "bg-[#0088cc]/10"}`}
          style={{ transform: [{ scale: pulseAnim }] }}
        >
          <View
            className={`w-5 h-5 rounded-full ${isDark ? "bg-blue-500" : "bg-[#0088cc]"}`}
          />
        </Animated.View>

        <View className="flex-1">
          <Text
            className={`text-base font-medium mb-1 ${isDark ? "text-white" : "text-neutral-900"}`}
          >
            Uploading...
          </Text>
          <View
            className={`h-1 rounded-full overflow-hidden ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}
          >
            <Animated.View
              className={`h-full rounded-full ${isDark ? "bg-blue-500" : "bg-[#0088cc]"}`}
              style={{
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};
