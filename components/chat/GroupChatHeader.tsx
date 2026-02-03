import { getInitials } from "@/utils/helpers";
import { ChevronLeft, MoreVertical, Phone, Video } from "lucide-react-native";
import React, { useRef } from "react";
import { Animated, Image, Pressable, Text, View } from "react-native";

interface GroupChatHeaderProps {
  isDark: boolean;
  groupName: string;
  groupAvatar?: string;
  participantCount: number;
  participants: any[];
  typingUsers?: string[];
  onBack: () => void;
  onGroupInfoPress: () => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
  onSearch?: () => void;
  onMoreOptions?: () => void;
}

const RippleButton: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "small" | "medium" | "large";
}> = ({ onPress, children, className = "", size = "medium" }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const sizeClass = {
    small: "p-1.5",
    medium: "p-2",
    large: "p-2.5",
  }[size];

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        className={`rounded-full ${sizeClass} ${className}`}
        style={{ transform: [{ scale }] }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

const StackedAvatars: React.FC<{
  participants: any[];
  isDark: boolean;
  maxVisible?: number;
}> = ({ participants, isDark, maxVisible = 3 }) => {
  const visibleParticipants = participants.slice(0, maxVisible);
  const remainingCount = Math.max(0, participants.length - maxVisible);

  return (
    <View className="flex-row items-center">
      {visibleParticipants.map((participant, index) => {
        const hasAvatar =
          participant?.avatar &&
          participant.avatar !== "M" &&
          participant.avatar !== "";
        const initials = participant ? getInitials(participant.name) : "";

        return (
          <View
            key={participant?.id || index}
            style={{
              marginLeft: index > 0 ? -8 : 0,
              zIndex: visibleParticipants.length - index,
            }}
          >
            <View
              className={`rounded-full border-2 ${
                isDark ? "border-gray-900" : "border-white"
              }`}
            >
              {hasAvatar ? (
                <Image
                  source={{ uri: participant.avatar }}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    isDark ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isDark ? "text-gray-100" : "text-gray-700"
                    }`}
                  >
                    {initials}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
      {remainingCount > 0 && (
        <View
          style={{
            marginLeft: -8,
            zIndex: 0,
          }}
        >
          <View
            className={`w-10 h-10 rounded-full items-center justify-center border-2 ${
              isDark
                ? "bg-gray-700 border-gray-900"
                : "bg-gray-200 border-white"
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                isDark ? "text-gray-100" : "text-gray-700"
              }`}
            >
              +{remainingCount}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const GroupAvatar: React.FC<{
  groupAvatar?: string;
  groupName: string;
  isDark: boolean;
}> = ({ groupAvatar, groupName, isDark }) => {
  const hasAvatar = groupAvatar && groupAvatar !== "" && groupAvatar !== "M";
  const initials = getInitials(groupName);

  return (
    <View
      className={`rounded-full p-0.5 ${
        isDark ? "bg-gray-700/50" : "bg-gray-300/50"
      }`}
    >
      {hasAvatar ? (
        <Image source={{ uri: groupAvatar }} className="w-10 h-10 rounded-full" />
      ) : (
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${
            isDark
              ? "bg-gradient-to-br from-blue-600 to-purple-600"
              : "bg-gradient-to-br from-blue-500 to-purple-500"
          }`}
        >
          <Text className="text-base font-bold text-white">{initials}</Text>
        </View>
      )}
    </View>
  );
};

export const GroupChatHeader: React.FC<GroupChatHeaderProps> = ({
  isDark,
  groupName,
  groupAvatar,
  participantCount,
  participants,
  typingUsers = [],
  onBack,
  onGroupInfoPress,
  onVoiceCall,
  onVideoCall,
  onSearch,
  onMoreOptions,
}) => {
  const getTypingText = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) {
      const typingUser = participants.find((p) => p.id === typingUsers[0]);
      return `${typingUser?.name || "Someone"} is typing...`;
    }
    if (typingUsers.length === 2) {
      return `${typingUsers.length} people are typing...`;
    }
    return "Several people are typing...";
  };

  const typingText = getTypingText();

  return (
    <View className="relative overflow-hidden">
      {/* Background layers */}
      <View
        className={`absolute inset-0 ${isDark ? "bg-black/75" : "bg-white/80"}`}
      />

      <View
        className={`absolute inset-0 ${
          isDark
            ? "bg-gradient-to-br from-gray-800/50 via-blue-900/15 to-gray-900/60"
            : "bg-gradient-to-br from-white/70 via-blue-100/30 to-gray-100/50"
        }`}
      />

      <View
        className={`absolute inset-0 ${
          isDark ? "bg-gray-900/20" : "bg-white/30"
        }`}
      />

      {/* Border effects */}
      <View
        className={`absolute top-0 left-0 right-0 h-px ${
          isDark ? "bg-white/10" : "bg-black/10"
        }`}
      />

      <View
        className={`absolute bottom-0 left-0 right-0 h-px ${
          isDark
            ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
            : "bg-gradient-to-r from-transparent via-gray-500/30 to-transparent"
        }`}
      />

      {/* Content */}
      <View className="relative pt-2 pb-3">
        <View className="flex-row items-center justify-between px-3">
          <View className="flex-row items-center flex-1">
            {/* Back button */}
            <RippleButton
              onPress={onBack}
              className={`mr-2 ${isDark ? "active:bg-white/10" : "active:bg-black/5"}`}
              size="medium"
            >
              <ChevronLeft
                size={26}
                color={isDark ? "#f9fafb" : "#111827"}
                strokeWidth={2.5}
              />
            </RippleButton>

            {/* Group info section */}
            <Pressable
              onPress={onGroupInfoPress}
              className="flex-row items-center flex-1 mr-2 active:opacity-80"
            >
              <View className="relative mr-3">
                <GroupAvatar
                  groupAvatar={groupAvatar}
                  groupName={groupName}
                  isDark={isDark}
                />
              </View>

              <View className="flex-1">
                <Text
                  className={`text-[17px] font-bold tracking-tight leading-5 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  numberOfLines={1}
                  style={{ letterSpacing: -0.3 }}
                >
                  {groupName}
                </Text>

                {typingText ? (
                  <Text
                    className="text-[13px] text-emerald-500 font-semibold mt-0.5"
                    numberOfLines={1}
                  >
                    {typingText}
                  </Text>
                ) : (
                  <Text
                    className={`text-[13px] font-medium mt-0.5 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                    numberOfLines={1}
                  >
                    {participantCount}{" "}
                    {participantCount === 1 ? "member" : "members"}
                  </Text>
                )}
              </View>
            </Pressable>
          </View>

          {/* Action buttons */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            {onVideoCall && (
              <RippleButton
                onPress={onVideoCall}
                className={`${isDark ? "active:bg-white/10" : "active:bg-black/5"}`}
                size="medium"
              >
                <Video
                  size={22}
                  color={isDark ? "#f9fafb" : "#111827"}
                  strokeWidth={2.2}
                />
              </RippleButton>
            )}

            {onVoiceCall && (
              <RippleButton
                onPress={onVoiceCall}
                className={`${isDark ? "active:bg-white/10" : "active:bg-black/5"}`}
                size="medium"
              >
                <Phone
                  size={21}
                  color={isDark ? "#f9fafb" : "#111827"}
                  strokeWidth={2.2}
                />
              </RippleButton>
            )}

            {onMoreOptions && (
              <RippleButton
                onPress={onMoreOptions}
                className={`${isDark ? "active:bg-white/10" : "active:bg-black/5"}`}
                size="medium"
              >
                <MoreVertical
                  size={22}
                  color={isDark ? "#f9fafb" : "#111827"}
                  strokeWidth={2.2}
                />
              </RippleButton>
            )}
          </View>
        </View>

        {/* Stacked avatars for participants preview */}
        {participants.length > 0 && (
          <View className="px-3 mt-2">
            <StackedAvatars participants={participants} isDark={isDark} />
          </View>
        )}
      </View>
    </View>
  );
};
