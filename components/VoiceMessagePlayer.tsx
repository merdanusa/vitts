import { Pause, Play } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

interface VoiceMessagePlayerProps {
  duration: number; // in seconds
  isMyMessage: boolean;
  isDark: boolean;
  audioUrl?: string;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  duration,
  isMyMessage,
  isDark,
  audioUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      // Pause logic
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      // Play logic
      setIsPlaying(true);
      // Simulate playback
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
  };

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentTime / duration,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [currentTime, duration]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const iconColor = isMyMessage ? "#ffffff" : isDark ? "#ffffff" : "#000000";
  const waveColor = isMyMessage
    ? "rgba(255, 255, 255, 0.3)"
    : isDark
      ? "rgba(255, 255, 255, 0.2)"
      : "rgba(0, 0, 0, 0.15)";
  const activeWaveColor = isMyMessage ? "#ffffff" : "#007AFF";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
        minWidth: 200,
      }}
    >
      {/* Play/Pause Button */}
      <TouchableOpacity
        onPress={togglePlayPause}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: isMyMessage
            ? "rgba(255, 255, 255, 0.2)"
            : isDark
              ? "rgba(255, 255, 255, 0.2)"
              : "rgba(0, 0, 0, 0.1)",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        {isPlaying ? (
          <Pause size={16} color={iconColor} fill={iconColor} />
        ) : (
          <Play size={16} color={iconColor} fill={iconColor} />
        )}
      </TouchableOpacity>

      {/* Waveform Visualization */}
      <View style={{ flex: 1, marginRight: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: 32,
            gap: 2,
          }}
        >
          {[...Array(20)].map((_, index) => {
            const heights = [
              8, 16, 12, 20, 14, 24, 10, 18, 22, 16, 12, 20, 14, 18, 10, 24, 16,
              12, 20, 14,
            ];
            const progress = currentTime / duration;
            const isActive = index / 20 <= progress;

            return (
              <View
                key={index}
                style={{
                  width: 2,
                  height: heights[index],
                  borderRadius: 1,
                  backgroundColor: isActive ? activeWaveColor : waveColor,
                }}
              />
            );
          })}
        </View>
      </View>

      {/* Duration */}
      <Text
        style={{
          color: isMyMessage
            ? "rgba(255, 255, 255, 0.8)"
            : isDark
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(0, 0, 0, 0.6)",
          fontSize: 12,
          fontWeight: "500",
          minWidth: 35,
        }}
      >
        {formatDuration(isPlaying ? currentTime : duration)}
      </Text>
    </View>
  );
};
