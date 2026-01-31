import { Group } from "@/services/api";
import { RootState } from "@/store";
import React from "react";
import { Image, Text, View } from "react-native";
import { useSelector } from "react-redux";

interface GroupListItemProps {
  group: Group;
}

export function GroupListItem({ group }: GroupListItemProps) {
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const participantCount = group.participants?.length || 0;

  const getInitials = (name: string): string => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(group.name);
  const hasAvatar =
    group.avatar && group.avatar !== "M" && group.avatar !== "";

  return (
    <View className="flex-row items-center">
      {/* Group Avatar */}
      <View className="mr-3 relative">
        {hasAvatar ? (
          <Image
            source={{ uri: group.avatar }}
            style={{ width: 56, height: 56, borderRadius: 28 }}
          />
        ) : (
          <View
            style={{
              backgroundColor: isDark ? "#262626" : "#f3f4f6",
              width: 56,
              height: 56,
              borderRadius: 28,
            }}
            className="items-center justify-center"
          >
            <Text
              style={{ color: isDark ? "#a1a1aa" : "#737373" }}
              className="text-xl font-medium"
            >
              {initials}
            </Text>
          </View>
        )}
      </View>

      {/* Group Info */}
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text
            style={{ color: isDark ? "#ffffff" : "#000000" }}
            className="font-semibold text-base"
            numberOfLines={1}
          >
            {group.name}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text
            style={{ color: isDark ? "#737373" : "#a1a1aa" }}
            className="text-sm flex-1"
            numberOfLines={1}
          >
            {participantCount} {participantCount === 1 ? "member" : "members"}
            {group.description && ` • ${group.description}`}
          </Text>
        </View>
      </View>
    </View>
  );
}
