import { Message } from "@/services/api";
import React, { forwardRef, useCallback } from "react";
import { FlatList } from "react-native";
import { MessageItem } from "./MessageItem";

interface MessagesListProps {
  messages: Message[];
  currentUserId: string;
  isDark: boolean;
}

export const MessagesList = forwardRef<FlatList, MessagesListProps>(
  ({ messages, currentUserId, isDark }, ref) => {
    const renderMessage = useCallback(
      ({ item, index }: { item: Message; index: number }) => {
        // Since the list is inverted, we need to check the previous message (not next)
        const previousMessage = messages[index - 1];
        const showTime =
          index === 0 ||
          !previousMessage ||
          new Date(item.time).getTime() -
            new Date(previousMessage.time).getTime() >
            300000;

        return (
          <MessageItem
            message={item}
            isMyMessage={item.senderId === currentUserId}
            showTime={showTime}
            isDark={isDark}
          />
        );
      },
      [currentUserId, messages, isDark],
    );

    const keyExtractor = useCallback((item: Message) => item.id, []);

    return (
      <FlatList
        ref={ref}
        data={[...messages].reverse()} // Reverse the array for inverted list
        keyExtractor={keyExtractor}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingVertical: 12 }}
        inverted={true} // This makes messages appear from bottom to top
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={15}
        updateCellsBatchingPeriod={50}
        windowSize={15}
      />
    );
  },
);

MessagesList.displayName = "MessagesList";
