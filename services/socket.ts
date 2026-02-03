  import { ENV } from "@/configs/env.config";
  import * as SecureStore from "expo-secure-store";
  import { io, Socket } from "socket.io-client";

  const SOCKET_URL = (
    ENV.EXPO_PUBLIC_API_URL || "https://vittsbackend-production.up.railway.app"
  ).replace(/\/$/, "");

  class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<Function>> = new Map();
    private socketListeners: Map<string, Map<Function, Function>> = new Map();

    async connect() {
      if (this.socket?.connected) {
        console.log("[SOCKET] Already connected");
        return;
      }

      try {
        const token = await SecureStore.getItem("token");
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

      const events = [
        "newMessage",
        "userTyping",
        "userStopTyping",
        "messagesRead",
        "messageReactionUpdated",
        "userOnlineStatus",
        "chatUpdated",
      ];

      events.forEach((event) => {
        const handler = (data: any) => {
          this.emit(event, data);
        };
        this.socket!.on(event, handler);
      });
    }

    disconnect() {
      if (this.socket) {
        // Clean up all socket listeners
        this.socketListeners.forEach((listenerMap, event) => {
          listenerMap.forEach((socketListener) => {
            this.socket!.off(event, socketListener as any);
          });
        });
        this.socketListeners.clear();

        this.socket.disconnect();
        this.socket = null;
        this.listeners.clear();
        console.log("[SOCKET] Disconnected");
      }
    }

    on(event: string, callback: Function) {
      // Add to local listener map
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event)?.add(callback);

      // Track socket listener for proper cleanup
      if (!this.socketListeners.has(event)) {
        this.socketListeners.set(event, new Map());
      }

      // Store the reference to the callback for removal later
      const listenerMap = this.socketListeners.get(event)!;
      listenerMap.set(callback, callback);
    }

    off(event: string, callback: Function) {
      // Remove from local listener map
      this.listeners.get(event)?.delete(callback);

      // Remove socket listener reference
      const listenerMap = this.socketListeners.get(event);
      if (listenerMap) {
        listenerMap.delete(callback);
        if (listenerMap.size === 0) {
          this.socketListeners.delete(event);
        }
      }

      // If no more listeners for this event, clean up completely
      if (this.listeners.get(event)?.size === 0) {
        this.listeners.delete(event);
      }
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
