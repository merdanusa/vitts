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
      ({ item, index }: { item: Message; index: number }) => (
        <MessageItem
          message={item}
          isMyMessage={item.senderId === currentUserId}
          showTime={
            index === messages.length - 1 ||
            new Date(messages[index + 1].time).getTime() -
              new Date(item.time).getTime() >
              300000
          }
          isDark={isDark}
        />
      ),
      [currentUserId, messages, isDark],
    );

    const keyExtractor = useCallback((item: Message) => item.id, []);

    return (
      <FlatList
        ref={ref}
        data={messages}
        keyExtractor={keyExtractor}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingVertical: 12 }}
        inverted={false}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          (ref as any)?.current?.scrollToEnd({ animated: false })
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={15}
        updateCellsBatchingPeriod={50}
        windowSize={15}
      />
    );
  },
);

MessagesList.displayName = "MessagesList";
