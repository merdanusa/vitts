import { getChatById, getCurrentUser, Message } from "@/services/api";
import {
  addMessage,
  prependMessages,
  selectChatById,
  selectChatMessages,
  selectHasMoreMessages,
  selectLoadingMessages,
  setHasMoreMessages,
  setLoadingMessages,
  setMessages,
} from "@/store/chatSlice";
import { useAppDispatch } from "@/store/hooks";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useSelector } from "react-redux";

export const useChatDataRedux = (chatId: string) => {
  const dispatch = useAppDispatch();

  // Memoize selector instances to avoid creating new functions each render
  const messagesSelector = useMemo(() => selectChatMessages(chatId), [chatId]);
  const loadingSelector = useMemo(() => selectLoadingMessages(chatId), [chatId]);
  const hasMoreSelector = useMemo(() => selectHasMoreMessages(chatId), [chatId]);
  const chatSelector = useMemo(() => selectChatById(chatId), [chatId]);

  const messages = useSelector(messagesSelector);
  const loadingMore = useSelector(loadingSelector);
  const hasMore = useSelector(hasMoreSelector);
  const chatData = useSelector(chatSelector);

  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadChat = useCallback(async () => {
    try {
      setLoading(true);
      const [data, userData] = await Promise.all([
        getChatById(chatId, { limit: 50 }),
        getCurrentUser(),
      ]);

      // Store messages in Redux
      dispatch(setMessages({ chatId, messages: data.messages }));
      dispatch(setHasMoreMessages({ chatId, hasMore: data.hasMore ?? false }));
      setCurrentUserId(userData.id);
    } catch (error) {
      console.error("Failed to load chat:", error);
      Alert.alert("Error", "Failed to load chat");
    } finally {
      setLoading(false);
    }
  }, [chatId, dispatch]);

  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || loadingMore || messages.length === 0) return;

    dispatch(setLoadingMessages({ chatId, loading: true }));
    try {
      const oldestMessage = messages[0];
      const data = await getChatById(chatId, {
        limit: 30,
        before: oldestMessage.id,
      });

      // Prepend older messages to Redux store
      dispatch(prependMessages({ chatId, messages: data.messages }));
      dispatch(setHasMoreMessages({ chatId, hasMore: data.hasMore ?? false }));
    } catch (error) {
      console.error("Failed to load more messages:", error);
      Alert.alert("Error", "Failed to load more messages");
    } finally {
      dispatch(setLoadingMessages({ chatId, loading: false }));
    }
  }, [chatId, hasMore, loadingMore, messages, dispatch]);

  const addNewMessage = useCallback(
    (message: Message) => {
      dispatch(addMessage({ chatId, message }));
    },
    [chatId, dispatch],
  );

  return {
    messages,
    chatData,
    currentUserId,
    loading,
    loadingMore,
    hasMore,
    loadChat,
    loadMoreMessages,
    addNewMessage,
  };
};
