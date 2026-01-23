import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
  AxiosInstance,
  AxiosProgressEvent,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.101:4000";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
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

api.interceptors.response.use(
  (response) => {
    console.log(
      `[API RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status}`,
    );
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("401 Unauthorized → removing token");
      await AsyncStorage.removeItem("token");
    }
    console.error(
      `[API ERROR] ${error.response?.status || "unknown"}`,
      error.response?.data || error.message,
    );
    return Promise.reject(error);
  },
);

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
  type: "text" | "image" | "voice" | string;
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
  time: string;
  isRead: boolean;
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
  type?: "text" | "image" | "voice" | string;
}

export const sendMessageHttp = async (
  chatId: string,
  data: SendMessagePayload,
): Promise<Message> => {
  console.log("[MESSAGE] Sending via HTTP:", data.type || "text");
  const res = await api.post<Message>(`/api/chats/${chatId}/message`, data);
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
