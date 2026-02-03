import { Message } from "@/services/api";
import { getDateLabel, shouldShowDateHeader } from "@/utils/dateHelpers";
import React, { forwardRef, useCallback, useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import { DateHeader } from "./DateHeader";
import { MessageItem } from "./MessageItem";

interface MessagesListProps {
  messages: Message[];
  currentUserId: string;
  isDark: boolean;
  isGroupChat?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  hasMore?: boolean;
  onMessageLongPress?: (message: Message) => void;
}

type ListItem =
  | { type: "message"; data: Message; index: number }
  | { type: "date"; data: string; id: string };

export const MessagesList = forwardRef<FlatList, MessagesListProps>(
  (
    {
      messages,
      currentUserId,
      isDark,
      isGroupChat = false,
      onLoadMore,
      loadingMore = false,
      hasMore = false,
      onMessageLongPress,
    },
    ref,
  ) => {
    // Memoize list data creation to prevent recalculation on every render
    const listData = useMemo((): ListItem[] => {
      const items: ListItem[] = [];
      const reversedMessages = [...messages].reverse();

      reversedMessages.forEach((message, index) => {
        const previousMessage = reversedMessages[index - 1];

        // Check if we need to show a date header
        if (shouldShowDateHeader(message, previousMessage || null)) {
          const dateLabel = getDateLabel(message.time);
          if (dateLabel) {
            items.push({
              type: "date",
              data: dateLabel,
              id: `date-${message.id}`,
            });
          }
        }

        // Add the message
        items.push({
          type: "message",
          data: message,
          index: messages.length - 1 - index, // Original index for time comparison
        });
      });

      return items;
    }, [messages]);

    const renderItem = useCallback(
      ({ item }: { item: ListItem }) => {
        if (item.type === "date") {
          return <DateHeader label={item.data} isDark={isDark} />;
        }

        const message = item.data;
        const messageIndex = item.index;

        // Check if we should show time (5+ minutes gap with previous message)
        const previousMessage = messages[messageIndex - 1];
        const showTime =
          messageIndex === 0 ||
          !previousMessage ||
          new Date(message.time).getTime() -
            new Date(previousMessage.time).getTime() >
            300000;

        return (
          <MessageItem
            message={message}
            isMyMessage={message.senderId === currentUserId}
            showTime={showTime}
            isDark={isDark}
            isGroupChat={isGroupChat}
            senderName={message.senderTitle}
            onLongPress={onMessageLongPress ? () => onMessageLongPress(message) : undefined}
          />
        );
      },
      [currentUserId, messages, isDark, isGroupChat, onMessageLongPress],
    );

    const keyExtractor = useCallback((item: ListItem) => {
      return item.type === "date" ? item.id : item.data.id;
    }, []);

    const renderListFooter = useCallback(() => {
      if (!loadingMore) return null;
      return (
        <View
          style={{
            padding: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: isDark ? "#737373" : "#a1a1aa", fontSize: 12 }}>
            Loading more messages...
          </Text>
        </View>
      );
    }, [loadingMore, isDark]);

    const handleEndReached = useCallback(() => {
      if (hasMore && !loadingMore && onLoadMore) {
        console.log("[MESSAGES LIST] Loading more messages");
        onLoadMore();
      }
    }, [hasMore, loadingMore, onLoadMore]);

    return (
      <FlatList
        ref={ref}
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 12 }}
        inverted={true}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={15}
        updateCellsBatchingPeriod={50}
        windowSize={15}
        className="mt-20"
        ListFooterComponent={renderListFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
      />
    );
  },
);

MessagesList.displayName = "MessagesList";
