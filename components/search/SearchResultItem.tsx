import { MessageSearchResult } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react";

interface SearchResultItemProps {
  result: MessageSearchResult;
  searchQuery: string;
  onPress: () => void;
}

export function SearchResultItem({
  result,
  searchQuery,
  onPress,
}: SearchResultItemProps) {
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
    <Pressable
      onPress={onPress}
      className="px-4 py-3 bg-white dark:bg-gray-900 active:bg-gray-50 dark:active:bg-gray-800 border-b border-gray-200 dark:border-gray-800"
    >
      {/* Sender Name & Date */}
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-sm font-medium text-gray-900 dark:text-white">
          {result.senderName}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {timeStr}
        </Text>
      </View>

      {/* Message Content with Highlights */}
      <View className="flex-row items-start">
        <View className="flex-1">
          <Text className="text-sm text-gray-700 dark:text-gray-300" numberOfLines={2}>
            {parts.map((part, index) => {
              const isHighlight =
                part.toLowerCase() === searchQuery.toLowerCase();
              return (
                <Text
                  key={index}
                  className={
                    isHighlight
                      ? "bg-yellow-200 dark:bg-yellow-700 font-semibold"
                      : ""
                  }
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
              color="#9CA3AF"
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}
