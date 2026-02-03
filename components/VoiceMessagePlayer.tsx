import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
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
  const [audioDuration, setAudioDuration] = useState(duration);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const positionUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Initialize audio player
  useEffect(() => {
    if (!audioUrl) return;

    const initPlayer = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
        });

        const player = createAudioPlayer(audioUrl);
        playerRef.current = player;

        // Set up event listeners
        player.playing = false;

      } catch (error) {
        console.error("[VoicePlayer] Failed to initialize:", error);
      }
    };

    initPlayer();

    return () => {
      // Cleanup
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
      if (playerRef.current) {
        try {
          playerRef.current.pause();
        } catch (error) {
          console.error("[VoicePlayer] Cleanup error:", error);
        }
      }
    };
  }, [audioUrl]);

  const updatePosition = async () => {
    if (!playerRef.current) return;

    try {
      const position = playerRef.current.currentTime;
      const duration = playerRef.current.duration || audioDuration;

      setCurrentTime(position);
      setAudioDuration(duration);

      // Check if playback finished
      if (position >= duration && isPlaying) {
        setIsPlaying(false);
        setCurrentTime(0);
        if (positionUpdateInterval.current) {
          clearInterval(positionUpdateInterval.current);
          positionUpdateInterval.current = null;
        }
      }
    } catch (error) {
      console.error("[VoicePlayer] Position update error:", error);
    }
  };

  const togglePlayPause = async () => {
    if (!playerRef.current || !audioUrl) {
      console.warn("[VoicePlayer] No player or audio URL");
      return;
    }

    try {
      if (isPlaying) {
        // Pause
        playerRef.current.pause();
        setIsPlaying(false);

        if (positionUpdateInterval.current) {
          clearInterval(positionUpdateInterval.current);
          positionUpdateInterval.current = null;
        }
      } else {
        // Play
        await playerRef.current.play();
        setIsPlaying(true);

        // Start position updates
        positionUpdateInterval.current = setInterval(updatePosition, 100);
      }
    } catch (error) {
      console.error("[VoicePlayer] Play/Pause error:", error);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: audioDuration > 0 ? currentTime / audioDuration : 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [currentTime, audioDuration]);

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
            const progress = audioDuration > 0 ? currentTime / audioDuration : 0;
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
        {formatDuration(isPlaying ? currentTime : audioDuration)}
      </Text>
    </View>
  );
};
