import axios, { AxiosInstance, AxiosProgressEvent } from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ────────────────────────────────────────────────
// Auth
// ────────────────────────────────────────────────
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
  const res = await api.post<AuthResponse>("/api/auth/register", data);
  return res.data;
};

export const login = async (data: LoginPayload): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/api/auth/login", data);
  return res.data;
};

// ────────────────────────────────────────────────
// User
// ────────────────────────────────────────────────
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
  return res.data;
};

export const uploadAvatar = async (
  file: File,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
): Promise<{ avatar: string }> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await api.post<{ avatar: string }>(
    "/api/users/upload-avatar",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    },
  );

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
  const res = await api.post<{ success: boolean }>("/api/users/me/fcm-token", {
    token,
  });
  return res.data;
};

// ────────────────────────────────────────────────
// Chats & Messages
// ────────────────────────────────────────────────
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
  const res = await api.get<FullChat>(`/api/chats/${chatId}`);
  return res.data;
};

export interface SendMessagePayload {
  content: string;
  type?: "text" | "image" | "voice" | string;
  // add duration, mediaUrl etc. if you implement media later
}

export const sendMessageHttp = async (
  chatId: string,
  data: SendMessagePayload,
): Promise<Message> => {
  const res = await api.post<Message>(`/api/chats/${chatId}/message`, data);
  return res.data;
};

export interface ToggleReactionPayload {
  emoji: string;
}

export interface ReactionResponse {
  success: boolean;
  reactions: Record<string, string[]>;
}

export const toggleReaction = async (
  chatId: string,
  messageId: string,
  emoji: string,
): Promise<ReactionResponse> => {
  const res = await api.post<ReactionResponse>(
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
  const res = await api.post<FullChat>("/api/chats/create-or-get", data);
  return res.data;
};

export const deleteChat = async (
  chatId: string,
): Promise<{ message: string }> => {
  const res = await api.delete<{ message: string }>(`/api/chats/${chatId}`);
  return res.data;
};

export default api;
