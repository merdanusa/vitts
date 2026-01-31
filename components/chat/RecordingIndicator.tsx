import { X } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

interface RecordingIndicatorProps {
  isDark: boolean;
  recordingAnimation: Animated.Value;
  recordingDuration: number;
  onStop: () => void;
  onCancel?: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
  isDark,
  recordingAnimation,
  recordingDuration,
  onStop,
  onCancel,
}) => {
  const wave1 = useRef(new Animated.Value(0.3)).current;
  const wave2 = useRef(new Animated.Value(0.5)).current;
  const wave3 = useRef(new Animated.Value(0.7)).current;
  const wave4 = useRef(new Animated.Value(0.5)).current;
  const wave5 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createWaveAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    const animations = Animated.parallel([
      createWaveAnimation(wave1, 0),
      createWaveAnimation(wave2, 80),
      createWaveAnimation(wave3, 160),
      createWaveAnimation(wave4, 80),
      createWaveAnimation(wave5, 0),
    ]);

    animations.start();

    return () => animations.stop();
  }, []);

  return (
    <View
      style={{
        backgroundColor: isDark ? "#1a1a1a" : "#f3f4f6",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: isDark ? "#262626" : "#e5e7eb",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          {/* Recording dot with pulse animation */}
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

          {/* Waveform animation */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 12,
              height: 24,
            }}
          >
            {[wave1, wave2, wave3, wave4, wave5].map((wave, index) => (
              <Animated.View
                key={index}
                style={{
                  width: 3,
                  height: 20,
                  borderRadius: 1.5,
                  backgroundColor: "#ef4444",
                  marginHorizontal: 1.5,
                  transform: [{ scaleY: wave }],
                }}
              />
            ))}
          </View>

          {/* Duration timer */}
          <Text
            style={{
              color: isDark ? "#ffffff" : "#000000",
              fontSize: 16,
              fontWeight: "600",
              fontVariant: ["tabular-nums"],
            }}
          >
            {formatTime(recordingDuration)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {/* Cancel button */}
          {onCancel && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCancel}
              style={{
                backgroundColor: isDark ? "#262626" : "#e5e7eb",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <X size={16} color={isDark ? "#ffffff" : "#000000"} />
              <Text
                style={{
                  color: isDark ? "#ffffff" : "#000000",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          )}

          {/* Send button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onStop}
            style={{
              backgroundColor: "#0088cc",
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
