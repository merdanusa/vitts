import { MessageSearchResult } from "@/services/api";
import { RootState } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { useSelector } from "react-redux";

interface SearchResultItemProps {
  result: MessageSearchResult;
  searchQuery: string;
  onPress: () => void;
}

export function SearchResultItem({
  result,
  searchQuery,
}: SearchResultItemProps) {
  const isDark = useSelector((state: RootState) => state.theme.isDark);

  // Simple highlight function
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts;
  };

  const parts = highlightText(result.content, searchQuery);
  const date = new Date(result.time);
  const timeStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <View>
      {/* Sender Name & Date */}
      <View className="flex-row items-center justify-between mb-1">
        <Text
          style={{ color: isDark ? "#ffffff" : "#000000" }}
          className="font-semibold text-base"
        >
          {result.senderName}
        </Text>
        <Text
          style={{ color: isDark ? "#737373" : "#a1a1aa" }}
          className="text-xs"
        >
          {timeStr}
        </Text>
      </View>

      {/* Message Content with Highlights */}
      <View className="flex-row items-start">
        <View className="flex-1">
          <Text
            style={{ color: isDark ? "#a1a1aa" : "#737373" }}
            className="text-sm"
            numberOfLines={2}
          >
            {parts.map((part, index) => {
              const isHighlight =
                part.toLowerCase() === searchQuery.toLowerCase();
              return (
                <Text
                  key={index}
                  style={{
                    backgroundColor: isHighlight
                      ? isDark
                        ? "#3a3a00"
                        : "#fef3c7"
                      : "transparent",
                    fontWeight: isHighlight ? "600" : "400",
                  }}
                >
                  {part}
                </Text>
              );
            })}
          </Text>
        </View>

        {/* Type Icon */}
        {result.type !== "text" && (
          <View className="ml-2">
            <Ionicons
              name={
                result.type === "image"
                  ? "image"
                  : result.type === "video"
                    ? "videocam"
                    : result.type === "voice"
                      ? "mic"
                      : "document"
              }
              size={16}
              color={isDark ? "#737373" : "#a1a1aa"}
            />
          </View>
        )}
      </View>
    </View>
  );
}
