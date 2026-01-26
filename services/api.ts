import { ENV } from "@/configs/env.config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosProgressEvent,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL = ENV.EXPO_PUBLIC_API_URL || "http://192.168.1.101:4000";

// ============================================================================
// AUTO-RECONNECT CONFIGURATION
// ============================================================================

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
  shouldRetry: (error: AxiosError) => boolean;
}

const RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // Base delay in ms
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  shouldRetry: (error: AxiosError) => {
    // Retry on network errors
    if (!error.response) return true;
    // Retry on specific status codes
    if (RETRY_CONFIG.retryableStatuses.includes(error.response.status)) {
      return true;
    }
    return false;
  },
};

// Track retry attempts
const retryCountMap = new Map<string, number>();

// Exponential backoff delay
const getRetryDelay = (retryCount: number): number => {
  return Math.min(RETRY_CONFIG.retryDelay * Math.pow(2, retryCount), 10000);
};

// ============================================================================
// AXIOS INSTANCE
// ============================================================================

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ============================================================================
// REQUEST INTERCEPTOR (with network check)
// ============================================================================

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Check network connectivity before making request
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.warn("[API] No internet connection");
        return Promise.reject(new Error("No internet connection"));
      }

      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(
        `[API REQUEST] ${config.method?.toUpperCase()} ${API_BASE_URL + config.url}`,
      );
      return config;
    } catch (error) {
      console.error("Failed to read token from AsyncStorage:", error);
      return config;
    }
  },
  (error) => {
    console.error("[API REQUEST ERROR]", error);
    return Promise.reject(error);
  },
);

// ============================================================================
// RESPONSE INTERCEPTOR (with auto-retry)
// ============================================================================

api.interceptors.response.use(
  (response) => {
    // Clear retry count on success
    const requestKey = `${response.config.method}-${response.config.url}`;
    retryCountMap.delete(requestKey);

    console.log(
      `[API RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status}`,
    );
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn("401 Unauthorized → removing token");
      await AsyncStorage.removeItem("token");
      return Promise.reject(error);
    }

    // Check if we should retry
    if (!originalRequest || originalRequest._retry) {
      console.error(
        `[API ERROR] ${error.response?.status || "unknown"}`,
        error.response?.data || error.message,
      );
      return Promise.reject(error);
    }

    // Get retry count for this request
    const requestKey = `${originalRequest.method}-${originalRequest.url}`;
    const retryCount = retryCountMap.get(requestKey) || 0;

    // Check if we should retry this error
    if (
      RETRY_CONFIG.shouldRetry(error) &&
      retryCount < RETRY_CONFIG.maxRetries
    ) {
      // Increment retry count
      retryCountMap.set(requestKey, retryCount + 1);
      originalRequest._retry = true;
      originalRequest._retryCount = retryCount + 1;

      // Calculate delay with exponential backoff
      const delay = getRetryDelay(retryCount);

      console.warn(
        `[API RETRY] Attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries} after ${delay}ms - ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`,
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Check network again before retry
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.warn("[API RETRY] No internet connection, waiting...");
        // Wait a bit longer if no connection
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Retry the request
      return api(originalRequest);
    }

    // Max retries reached or non-retryable error
    retryCountMap.delete(requestKey);
    console.error(
      `[API ERROR] ${error.response?.status || "unknown"}`,
      error.response?.data || error.message,
    );
    return Promise.reject(error);
  },
);

// ============================================================================
// NETWORK MONITORING
// ============================================================================

let isOnline = true;
let reconnectCallbacks: (() => void)[] = [];

// Subscribe to network changes
NetInfo.addEventListener((state) => {
  const wasOffline = !isOnline;
  isOnline = state.isConnected ?? true;

  if (wasOffline && isOnline) {
    console.log("[NETWORK] Connection restored - triggering callbacks");
    // Clear all retry counts
    retryCountMap.clear();
    // Trigger all registered callbacks
    reconnectCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (err) {
        console.error("[NETWORK] Callback error:", err);
      }
    });
  } else if (!isOnline) {
    console.warn("[NETWORK] Connection lost");
  }
});

// Register callback to be called when network reconnects
export const onReconnect = (callback: () => void): (() => void) => {
  reconnectCallbacks.push(callback);
  // Return unsubscribe function
  return () => {
    reconnectCallbacks = reconnectCallbacks.filter((cb) => cb !== callback);
  };
};

// Check current network status
export const checkNetworkStatus = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected ?? false;
};

// ============================================================================
// AUTH API
// ============================================================================

export interface RegisterPayload {
  name: string;
  login: string;
  email?: string;
  password: string;
}

export interface LoginPayload {
  login: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    login: string;
    email: string | null;
    avatar: string;
    isOnline: boolean;
  };
}

export const register = async (
  data: RegisterPayload,
): Promise<AuthResponse> => {
  console.log("[AUTH] Register attempt:", data.login);
  const res = await api.post<AuthResponse>("/api/auth/register", data);
  if (res.data.token) {
    await AsyncStorage.setItem("token", res.data.token);
    console.log("[AUTH] Token saved after register");
  }
  return res.data;
};

export const login = async (data: LoginPayload): Promise<AuthResponse> => {
  console.log("[AUTH] Login attempt:", data.login);
  const res = await api.post<AuthResponse>("/api/auth/login", data);
  if (res.data.token) {
    await AsyncStorage.setItem("token", res.data.token);
    console.log("[AUTH] Token saved after login");
  }
  return res.data;
};

export const logout = async () => {
  console.log("[AUTH] Logging out – clearing token");
  await AsyncStorage.removeItem("token");
};

// ============================================================================
// USER API
// ============================================================================

export interface UserProfile {
  id: string;
  name: string;
  login: string;
  email: string | null;
  avatar: string;
  birthday?: string | null;
  bio: string;
  isOnline: boolean;
  createdAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  login?: string;
  email?: string;
  birthday?: string;
  bio?: string;
}

export const getCurrentUser = async (): Promise<UserProfile> => {
  const res = await api.get<UserProfile>("/api/users/me");
  return res.data;
};

export const updateProfile = async (
  data: UpdateProfilePayload,
): Promise<UserProfile> => {
  const res = await api.patch<UserProfile>("/api/users/me", data);
  console.log("[USER] Profile updated");
  return res.data;
};

export const uploadAvatar = async (
  file: any,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
): Promise<{ avatar: string }> => {
  console.log("[USER] Uploading avatar:", file?.fileName || file?.uri);

  const formData = new FormData();
  formData.append("avatar", {
    uri: file.uri,
    name: file.fileName || `avatar-${Date.now()}.jpg`,
    type: file.mimeType || "image/jpeg",
  } as any);

  const res = await api.post<{ avatar: string }>(
    "/api/users/upload-avatar",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    },
  );

  console.log("[USER] Avatar uploaded successfully");
  return res.data;
};

export interface SearchUser {
  id: string;
  name: string;
  login: string;
  avatar: string;
  isOnline: boolean;
}

export const searchUsers = async (query: string): Promise<SearchUser[]> => {
  console.log("[USER] Searching users:", query);
  const res = await api.get<SearchUser[]>("/api/users/search", {
    params: { q: query.trim() },
  });
  return res.data;
};

export const getAllUsers = async (): Promise<SearchUser[]> => {
  const res = await api.get<SearchUser[]>("/api/users/all");
  return res.data;
};

export const saveFcmToken = async (
  token: string,
): Promise<{ success: boolean }> => {
  console.log("[FCM] Saving token");
  const res = await api.post<{ success: boolean }>("/api/users/me/fcm-token", {
    token,
  });
  console.log("[FCM] Token saved:", res.data.success);
  return res.data;
};

// ============================================================================
// CHAT API
// ============================================================================

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  login?: string;
}

export interface LastMessage {
  id: string;
  content: string;
  time: string;
  type: "text" | "image" | "voice" | "document" | string;
  isRead: boolean;
  senderId: string | null;
}

export interface ChatListItem {
  id: string;
  participant: Participant;
  lastMessage: LastMessage | null;
}

export const getMyChats = async (): Promise<ChatListItem[]> => {
  const res = await api.get<ChatListItem[]>("/api/chats/my-chats");
  return res.data;
};

export interface Message {
  id: string;
  senderTitle: string;
  senderId: string;
  type: string;
  content: string;
  mediaUrl?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  duration?: number;
  time: string;
  isRead: boolean;
  reactions?: Record<string, string[]>;
  replyTo?: string;
}

export interface FullChat {
  id: string;
  participants: Participant[];
  messages: Message[];
}

export const getChatById = async (chatId: string): Promise<FullChat> => {
  console.log("[CHAT] Loading chat:", chatId);
  const res = await api.get<FullChat>(`/api/chats/${chatId}`);
  return res.data;
};

export interface SendMessagePayload {
  content: string;
  type?: "text" | "image" | "voice" | "document" | string;
  duration?: number;
}

export const sendMessageHttp = async (
  chatId: string,
  data: SendMessagePayload,
): Promise<Message> => {
  console.log("[MESSAGE] Sending via HTTP:", data.type || "text");
  const res = await api.post<Message>(`/api/chats/${chatId}/message`, data);
  return res.data;
};

export const sendFileMessage = async (
  chatId: string,
  fileUri: string,
  fileName: string,
  mimeType: string,
  type: "image" | "document" | "voice" | "video" = "document",
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
): Promise<Message> => {
  console.log("[MESSAGE] Uploading file:", fileName, type);

  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as any);
  formData.append("type", type);

  const res = await api.post<Message>(
    `/api/chats/${chatId}/message`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
      timeout: 60000,
    },
  );

  console.log("[MESSAGE] File uploaded successfully");
  return res.data;
};

export const toggleReaction = async (
  chatId: string,
  messageId: string,
  emoji: string,
): Promise<{ success: boolean; reactions: Record<string, string[]> }> => {
  console.log("[REACTION] Toggling", emoji, "on message", messageId);
  const res = await api.post(
    `/api/chats/${chatId}/message/${messageId}/react`,
    { emoji },
  );
  return res.data;
};

export interface CreateChatPayload {
  otherUserId: string;
}

export const createOrGetChat = async (
  data: CreateChatPayload,
): Promise<FullChat> => {
  console.log("[CHAT] Creating / getting chat with:", data.otherUserId);
  const res = await api.post<FullChat>("/api/chats/create-or-get", data);
  return res.data;
};

export const deleteChat = async (
  chatId: string,
): Promise<{ message: string }> => {
  console.log("[CHAT] Deleting chat:", chatId);
  const res = await api.delete<{ message: string }>(`/api/chats/${chatId}`);
  return res.data;
};

// ============================================================================
// PASSWORD RESET API
// ============================================================================

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export const forgotPassword = async (
  data: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> => {
  console.log("[AUTH] Forgot password request for:", data.email);

  try {
    const res = await api.post<ForgotPasswordResponse>(
      "/api/auth/forgot-password",
      data,
    );
    console.log("[AUTH] Forgot password response:", res.data.message);
    return res.data;
  } catch (err: any) {
    console.error(
      "[AUTH] Forgot password failed:",
      err.response?.data || err.message,
    );
    throw err;
  }
};

export interface ResetPasswordPayload {
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyEmailResponse {
  token: string;
  user: {
    id: string;
    name: string;
    login: string;
    email: string | null;
    avatar: string;
    isOnline: boolean;
    verified: boolean;
  };
}

export const verifyEmail = async (data: {
  code: string;
}): Promise<VerifyEmailResponse> => {
  console.log("[AUTH] Verifying email with code:", data.code);

  try {
    const res = await api.post<VerifyEmailResponse>(
      "/api/auth/verify-email",
      data,
    );

    if (res.data.token) {
      await AsyncStorage.setItem("token", res.data.token);
      console.log("[AUTH] Token saved after email verification");
    }

    return res.data;
  } catch (err: any) {
    console.error(
      "[AUTH] Email verification failed:",
      err.response?.data || err.message,
    );
    throw err;
  }
};

export const resetPassword = async (
  data: ResetPasswordPayload,
): Promise<ResetPasswordResponse> => {
  console.log("[AUTH] Reset password attempt with code:", data.code);

  try {
    const res = await api.post<ResetPasswordResponse>(
      "/api/auth/reset-password",
      data,
    );
    console.log("[AUTH] Password reset successful:", res.data.message);

    return res.data;
  } catch (err: any) {
    console.error(
      "[AUTH] Reset password failed:",
      err.response?.data || err.message,
    );
    throw err;
  }
};

export default api;
