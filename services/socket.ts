import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.101:4000"
).replace(/\/$/, "");

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  async connect() {
    if (this.socket?.connected) {
      console.log("[SOCKET] Already connected");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("[SOCKET] No token found");
        return;
      }

      console.log("[SOCKET] Connecting to:", SOCKET_URL);

      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      this.socket.on("connect", () => {
        console.log("[SOCKET] Connected:", this.socket?.id);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("[SOCKET] Disconnected:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.error("[SOCKET] Connection error:", error.message);
        if (
          error.message.includes("Authentication") ||
          error.message.includes("Invalid token")
        ) {
          console.error(
            "[SOCKET] Token might be expired or invalid. Try logging in again.",
          );
        }
      });

      this.socket.on("error", (error) => {
        console.error("[SOCKET] Socket error:", error);
      });

      this.setupInternalListeners();
    } catch (error) {
      console.error("[SOCKET] Connection failed:", error);
    }
  }

  private setupInternalListeners() {
    if (!this.socket) return;

    this.socket.on("newMessage", (data) => {
      this.emit("newMessage", data);
    });

    this.socket.on("userTyping", (data) => {
      this.emit("userTyping", data);
    });

    this.socket.on("userStopTyping", (data) => {
      this.emit("userStopTyping", data);
    });

    this.socket.on("messagesRead", (data) => {
      this.emit("messagesRead", data);
    });

    this.socket.on("messageReactionUpdated", (data) => {
      this.emit("messageReactionUpdated", data);
    });

    this.socket.on("userOnlineStatus", (data) => {
      this.emit("userOnlineStatus", data);
    });

    this.socket.on("chatUpdated", (data) => {
      this.emit("chatUpdated", data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log("[SOCKET] Disconnected");
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  sendMessage(params: {
    chatId: string;
    content: string;
    type?: string;
    duration?: number;
  }) {
    if (!this.socket?.connected) {
      console.error("[SOCKET] Not connected");
      return;
    }

    this.socket.emit("sendMessage", {
      chatId: params.chatId,
      content: params.content,
      type: params.type || "text",
      duration: params.duration,
    });
  }

  markRead(chatId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit("markRead", { chatId });
  }

  typing(chatId: string, toUserId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit("typing", { chatId, toUserId });
  }

  stopTyping(chatId: string, toUserId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit("stopTyping", { chatId, toUserId });
  }

  addReaction(chatId: string, messageId: string, emoji: string) {
    if (!this.socket?.connected) return;
    this.socket.emit("addMessageReaction", { chatId, messageId, emoji });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
