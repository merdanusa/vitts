import { ChatListItem, Message } from "@/services/api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./index";

export interface ChatState {
  chats: Record<string, ChatListItem>; // chatId -> chat
  messages: Record<string, Message[]>; // chatId -> messages array
  typingUsers: Record<string, string[]>; // chatId -> array of userIds typing
  onlineUsers: Record<string, boolean>; // userId -> isOnline status
  pendingMessages: Message[]; // Offline queue
  activeChat: string | null; // Currently viewing chat ID
  loadingChats: boolean;
  loadingMessages: Record<string, boolean>; // chatId -> loading state
  hasMoreMessages: Record<string, boolean>; // chatId -> hasMore flag
}

const initialState: ChatState = {
  chats: {},
  messages: {},
  typingUsers: {},
  onlineUsers: {},
  pendingMessages: [],
  activeChat: null,
  loadingChats: false,
  loadingMessages: {},
  hasMoreMessages: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Chat list actions
    setChats: (state, action: PayloadAction<ChatListItem[]>) => {
      state.chats = {};
      action.payload.forEach((chat) => {
        state.chats[chat.id] = chat;
      });
    },

    addChat: (state, action: PayloadAction<ChatListItem>) => {
      state.chats[action.payload.id] = action.payload;
    },

    updateChat: (
      state,
      action: PayloadAction<{ chatId: string; updates: Partial<ChatListItem> }>,
    ) => {
      const { chatId, updates } = action.payload;
      if (state.chats[chatId]) {
        state.chats[chatId] = { ...state.chats[chatId], ...updates };
      }
    },

    deleteChat: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      delete state.chats[chatId];
      delete state.messages[chatId];
      delete state.typingUsers[chatId];
      delete state.loadingMessages[chatId];
      delete state.hasMoreMessages[chatId];
    },

    setLoadingChats: (state, action: PayloadAction<boolean>) => {
      state.loadingChats = action.payload;
    },

    // Message actions
    setMessages: (
      state,
      action: PayloadAction<{ chatId: string; messages: Message[] }>,
    ) => {
      const { chatId, messages } = action.payload;
      state.messages[chatId] = messages;
    },

    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: Message }>,
    ) => {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      // Check if message already exists (prevent duplicates)
      const exists = state.messages[chatId].some((m) => m.id === message.id);
      if (!exists) {
        state.messages[chatId].push(message);
      }

      // Update last message in chat list
      if (state.chats[chatId]) {
        state.chats[chatId].lastMessage = {
          id: message.id,
          content: message.content,
          time: message.time,
          type: message.type,
          isRead: message.isRead,
          senderId: message.senderId,
        };
      }
    },

    prependMessages: (
      state,
      action: PayloadAction<{ chatId: string; messages: Message[] }>,
    ) => {
      const { chatId, messages } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = messages;
      } else {
        // Add older messages to the beginning
        state.messages[chatId] = [...messages, ...state.messages[chatId]];
      }
    },

    updateMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        updates: Partial<Message>;
      }>,
    ) => {
      const { chatId, messageId, updates } = action.payload;
      const messages = state.messages[chatId];
      if (messages) {
        const index = messages.findIndex((m) => m.id === messageId);
        if (index !== -1) {
          messages[index] = { ...messages[index], ...updates };
        }
      }
    },

    deleteMessage: (
      state,
      action: PayloadAction<{ chatId: string; messageId: string }>,
    ) => {
      const { chatId, messageId } = action.payload;
      const messages = state.messages[chatId];
      if (messages) {
        state.messages[chatId] = messages.filter((m) => m.id !== messageId);
      }
    },

    setLoadingMessages: (
      state,
      action: PayloadAction<{ chatId: string; loading: boolean }>,
    ) => {
      const { chatId, loading } = action.payload;
      state.loadingMessages[chatId] = loading;
    },

    setHasMoreMessages: (
      state,
      action: PayloadAction<{ chatId: string; hasMore: boolean }>,
    ) => {
      const { chatId, hasMore } = action.payload;
      state.hasMoreMessages[chatId] = hasMore;
    },

    // Typing indicator actions
    setTyping: (
      state,
      action: PayloadAction<{ chatId: string; userId: string }>,
    ) => {
      const { chatId, userId } = action.payload;
      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = [];
      }
      if (!state.typingUsers[chatId].includes(userId)) {
        state.typingUsers[chatId].push(userId);
      }
    },

    clearTyping: (
      state,
      action: PayloadAction<{ chatId: string; userId: string }>,
    ) => {
      const { chatId, userId } = action.payload;
      if (state.typingUsers[chatId]) {
        state.typingUsers[chatId] = state.typingUsers[chatId].filter(
          (id) => id !== userId,
        );
      }
    },

    // Online status actions
    setUserOnline: (
      state,
      action: PayloadAction<{ userId: string; isOnline: boolean }>,
    ) => {
      const { userId, isOnline } = action.payload;
      state.onlineUsers[userId] = isOnline;

      // Update participant status in all chats
      Object.values(state.chats).forEach((chat) => {
        if (chat.participant.id === userId) {
          chat.participant.isOnline = isOnline;
        }
      });
    },

    // Offline message queue actions
    queueMessage: (state, action: PayloadAction<Message>) => {
      state.pendingMessages.push(action.payload);
    },

    removePendingMessage: (state, action: PayloadAction<string>) => {
      state.pendingMessages = state.pendingMessages.filter(
        (m) => m.id !== action.payload,
      );
    },

    clearPendingMessages: (state) => {
      state.pendingMessages = [];
    },

    // Active chat
    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChat = action.payload;
    },

    // Mark messages as read
    markChatAsRead: (
      state,
      action: PayloadAction<{ chatId: string; userId: string }>,
    ) => {
      const { chatId, userId } = action.payload;
      const messages = state.messages[chatId];
      if (messages) {
        messages.forEach((message) => {
          if (message.senderId !== userId) {
            message.isRead = true;
          }
        });
      }

      // Update last message read status in chat list
      if (state.chats[chatId]?.lastMessage) {
        if (state.chats[chatId].lastMessage?.senderId !== userId) {
          state.chats[chatId].lastMessage!.isRead = true;
        }
      }
    },
  },
});

export const {
  setChats,
  addChat,
  updateChat,
  deleteChat,
  setLoadingChats,
  setMessages,
  addMessage,
  prependMessages,
  updateMessage,
  deleteMessage,
  setLoadingMessages,
  setHasMoreMessages,
  setTyping,
  clearTyping,
  setUserOnline,
  queueMessage,
  removePendingMessage,
  clearPendingMessages,
  setActiveChat,
  markChatAsRead,
} = chatSlice.actions;

// Selectors
export const selectChatList = (state: RootState): ChatListItem[] => {
  return Object.values(state.chat.chats).sort((a, b) => {
    const timeA = a.lastMessage?.time
      ? new Date(a.lastMessage.time).getTime()
      : 0;
    const timeB = b.lastMessage?.time
      ? new Date(b.lastMessage.time).getTime()
      : 0;
    return timeB - timeA; // Most recent first
  });
};

export const selectChatById = (chatId: string) => (state: RootState) => {
  return state.chat.chats[chatId];
};

export const selectChatMessages =
  (chatId: string) =>
  (state: RootState): Message[] => {
    return state.chat.messages[chatId] || [];
  };

export const selectUnreadCount =
  (chatId: string, currentUserId: string) => (state: RootState) => {
    const messages = state.chat.messages[chatId] || [];
    return messages.filter(
      (m) => m.senderId !== currentUserId && !m.isRead,
    ).length;
  };

export const selectIsTyping =
  (chatId: string) =>
  (state: RootState): boolean => {
    return (state.chat.typingUsers[chatId] || []).length > 0;
  };

export const selectTypingUsers =
  (chatId: string) =>
  (state: RootState): string[] => {
    return state.chat.typingUsers[chatId] || [];
  };

export const selectPendingMessages = (state: RootState): Message[] => {
  return state.chat.pendingMessages;
};

export const selectIsUserOnline =
  (userId: string) => (state: RootState) => {
    return state.chat.onlineUsers[userId] ?? false;
  };

export const selectLoadingMessages =
  (chatId: string) => (state: RootState) => {
    return state.chat.loadingMessages[chatId] ?? false;
  };

export const selectHasMoreMessages =
  (chatId: string) => (state: RootState) => {
    return state.chat.hasMoreMessages[chatId] ?? true;
  };

export const selectActiveChat = (state: RootState) => {
  return state.chat.activeChat;
};

export const selectLoadingChats = (state: RootState) => {
  return state.chat.loadingChats;
};

export default chatSlice.reducer;
