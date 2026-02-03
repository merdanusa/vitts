import { Message } from "@/services/api";
import { socketService } from "@/services/socket";
import {
  addChat,
  addMessage,
  clearTyping,
  markChatAsRead,
  setTyping,
  setUserOnline,
  updateMessage,
} from "@/store/chatSlice";
import { useAppDispatch } from "@/store/hooks";
import { useEffect } from "react";

/**
 * Socket-to-Redux Bridge Hook
 * Listens to socket events and dispatches Redux actions to update global state
 * Should be initialized once at app level (e.g., in _layout or main tab screen)
 */
export const useSocketReduxBridge = (currentUserId?: string) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!currentUserId) return;

    console.log("[SOCKET BRIDGE] Initializing socket-to-Redux bridge");

    // New message handler
    const handleNewMessage = (data: any) => {
      console.log("[SOCKET BRIDGE] New message received:", data);

      const message: Message = {
        id: data.id,
        senderTitle: data.senderTitle,
        senderId: data.senderId,
        type: data.type,
        content: data.content || data.mediaUrl || "",
        mediaUrl: data.mediaUrl,
        fileName: data.fileName,
        mimeType: data.mimeType,
        duration: data.duration,
        time: data.time,
        isRead: data.isRead ?? false,
        reactions: data.reactions,
        replyTo: data.replyTo,
      };

      dispatch(addMessage({ chatId: data.chatId, message }));
    };

    // Typing indicator handlers
    const handleUserTyping = (data: { chatId: string; fromUserId: string }) => {
      console.log("[SOCKET BRIDGE] User typing:", data);
      dispatch(setTyping({ chatId: data.chatId, userId: data.fromUserId }));
    };

    const handleUserStopTyping = (data: {
      chatId: string;
      fromUserId: string;
    }) => {
      console.log("[SOCKET BRIDGE] User stopped typing:", data);
      dispatch(clearTyping({ chatId: data.chatId, userId: data.fromUserId }));
    };

    // Messages read handler
    const handleMessagesRead = (data: {
      chatId: string;
      userId: string;
      messageIds: string[];
    }) => {
      console.log("[SOCKET BRIDGE] Messages read:", data);
      dispatch(markChatAsRead({ chatId: data.chatId, userId: currentUserId }));
    };

    // Message reaction handler
    const handleMessageReactionUpdated = (data: {
      chatId: string;
      messageId: string;
      reactions: any;
    }) => {
      console.log("[SOCKET BRIDGE] Message reaction updated:", data);
      dispatch(
        updateMessage({
          chatId: data.chatId,
          messageId: data.messageId,
          updates: { reactions: data.reactions },
        }),
      );
    };

    // Online status handler
    const handleUserOnlineStatus = (data: {
      userId: string;
      isOnline: boolean;
      lastSeen?: string;
    }) => {
      console.log("[SOCKET BRIDGE] User online status:", data);
      dispatch(setUserOnline({ userId: data.userId, isOnline: data.isOnline }));
    };

    // Chat updated handler (for chat list refresh)
    const handleChatUpdated = (data: any) => {
      console.log("[SOCKET BRIDGE] Chat updated:", data);
      // If we have chat data, update it
      if (data.chat) {
        dispatch(addChat(data.chat));
      }
    };

    // Register socket listeners
    socketService.on("newMessage", handleNewMessage);
    socketService.on("userTyping", handleUserTyping);
    socketService.on("userStopTyping", handleUserStopTyping);
    socketService.on("messagesRead", handleMessagesRead);
    socketService.on("messageReactionUpdated", handleMessageReactionUpdated);
    socketService.on("userOnlineStatus", handleUserOnlineStatus);
    socketService.on("chatUpdated", handleChatUpdated);

    // Cleanup on unmount
    return () => {
      console.log("[SOCKET BRIDGE] Cleaning up socket-to-Redux bridge");
      socketService.off("newMessage", handleNewMessage);
      socketService.off("userTyping", handleUserTyping);
      socketService.off("userStopTyping", handleUserStopTyping);
      socketService.off("messagesRead", handleMessagesRead);
      socketService.off("messageReactionUpdated", handleMessageReactionUpdated);
      socketService.off("userOnlineStatus", handleUserOnlineStatus);
      socketService.off("chatUpdated", handleChatUpdated);
    };
  }, [dispatch, currentUserId]);
};
