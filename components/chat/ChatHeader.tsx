import { getInitials } from "@/utils/helpers";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ChatHeaderProps {
  isDark: boolean;
  participant: any;
  isTyping: boolean;
  onBack: () => void;
}

const TypingIndicator: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDotAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: -6,
            duration: 400,
            delay,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    const animations = Animated.parallel([
      createDotAnimation(dot1, 0),
      createDotAnimation(dot2, 150),
      createDotAnimation(dot3, 300),
    ]);

    animations.start();

    return () => animations.stop();
  }, []);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", height: 16 }}>
      {[dot1, dot2, dot3].map((dot, index) => (
        <Animated.View
          key={index}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: isDark ? "#737373" : "#a1a1aa",
            marginHorizontal: 2,
            transform: [{ translateY: dot }],
          }}
        />
      ))}
    </View>
  );
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  isDark,
  participant,
  isTyping,
  onBack,
}) => {
  const hasAvatar =
    participant?.avatar &&
    participant.avatar !== "M" &&
    participant.avatar !== "";
  const initials = participant ? getInitials(participant.name) : "";

  return (
    <View
      style={{
        borderBottomWidth: 0.5,
        borderBottomColor: isDark ? "#1a1a1a" : "#f3f4f6",
        backgroundColor: isDark ? "#000000" : "#ffffff",
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={{ marginRight: 12 }}
        >
          <ChevronLeft size={28} color={isDark ? "#ffffff" : "#007AFF"} />
        </TouchableOpacity>

        <View style={{ marginRight: 12, position: "relative" }}>
          {hasAvatar ? (
            <Image
              source={{ uri: participant.avatar }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          ) : (
            <View
              style={{
                backgroundColor: isDark ? "#262626" : "#f3f4f6",
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: isDark ? "#a1a1aa" : "#737373",
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                {initials}
              </Text>
            </View>
          )}
          {participant?.isOnline && (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                backgroundColor: "#22c55e",
                borderRadius: 6,
                borderWidth: 2,
                borderColor: isDark ? "#000000" : "#ffffff",
              }}
            />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: isDark ? "#ffffff" : "#000000",
              fontSize: 16,
              fontWeight: "600",
            }}
            numberOfLines={1}
          >
            {participant?.name || "Chat"}
          </Text>
          {isTyping ? (
            <TypingIndicator isDark={isDark} />
          ) : (
            <Text
              style={{
                color: isDark ? "#737373" : "#a1a1aa",
                fontSize: 12,
              }}
            >
              {participant?.isOnline ? "online" : "offline"}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};
