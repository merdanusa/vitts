import { ENV } from "@/configs/env.config";
import NetInfo from "@react-native-community/netinfo";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosProgressEvent,
  InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL =
  ENV.EXPO_PUBLIC_API_URL || "https://vittsbackend-production.up.railway.app";

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
  shouldRetry: (error: AxiosError) => boolean;
}

const RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  shouldRetry: (error: AxiosError) => {
    if (!error.response) return true;
    if (RETRY_CONFIG.retryableStatuses.includes(error.response.status)) {
      return true;
    }
    return false;
  },
};

const retryCountMap = new Map<string, number>();

const getRetryDelay = (retryCount: number): number => {
  return Math.min(RETRY_CONFIG.retryDelay * Math.pow(2, retryCount), 10000);
};

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.warn("[API] No internet connection");
        return Promise.reject(new Error("No internet connection"));
      }

      const token = await SecureStore.getItemAsync("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(
        `[API REQUEST] ${config.method?.toUpperCase()} ${API_BASE_URL + config.url}`,
      );
      return config;
    } catch (error) {
      console.error("Failed to read token from SecureStore:", error);
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

    if (error.response?.status === 401) {
      if (originalRequest.headers?.Authorization) {
        console.warn("401 Unauthorized with token → removing token");
        await SecureStore.deleteItemAsync("token");
      } else {
        console.warn("401 Unauthorized - no token provided");
      }
      return Promise.reject(error);
    }

    if (!originalRequest || originalRequest._retry) {
      console.error(
        `[API ERROR] ${error.response?.status || "unknown"}`,
        error.response?.data || error.message,
      );
      return Promise.reject(error);
    }

    const requestKey = `${originalRequest.method}-${originalRequest.url}`;
    const retryCount = retryCountMap.get(requestKey) || 0;

    if (
      RETRY_CONFIG.shouldRetry(error) &&
      retryCount < RETRY_CONFIG.maxRetries
    ) {
      retryCountMap.set(requestKey, retryCount + 1);
      originalRequest._retry = true;
      originalRequest._retryCount = retryCount + 1;

      const delay = getRetryDelay(retryCount);

      console.warn(
        `[API RETRY] Attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries} after ${delay}ms - ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));

      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.warn("[API RETRY] No internet connection, waiting...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      return api(originalRequest);
    }

    retryCountMap.delete(requestKey);
    console.error(
      `[API ERROR] ${error.response?.status || "unknown"}`,
      error.response?.data || error.message,
    );
    return Promise.reject(error);
  },
);

let isOnline = true;
let reconnectCallbacks: (() => void)[] = [];

NetInfo.addEventListener((state) => {
  const wasOffline = !isOnline;
  isOnline = state.isConnected ?? true;

  if (wasOffline && isOnline) {
    console.log("[NETWORK] Connection restored - triggering callbacks");
    retryCountMap.clear();
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

export const onReconnect = (callback: () => void): (() => void) => {
  reconnectCallbacks.push(callback);
  return () => {
    reconnectCallbacks = reconnectCallbacks.filter((cb) => cb !== callback);
  };
};

export const checkNetworkStatus = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected ?? false;
};

export interface RegisterPayload {
  name: string;
  login: string;
  email?: string;
  password: string;
  phoneNumber?: string;
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
    phoneNumber?: string | null;
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
    await SecureStore.setItemAsync("token", res.data.token);
    console.log("[AUTH] Token saved after register");
  }
  return res.data;
};

export const login = async (data: LoginPayload): Promise<AuthResponse> => {
  console.log("[AUTH] Login attempt:", data.login);
  const res = await api.post<AuthResponse>("/api/auth/login", data);
  if (res.data.token) {
    await SecureStore.setItemAsync("token", res.data.token);
    console.log("[AUTH] Token saved after login");
  }
  return res.data;
};

export const logout = async () => {
  console.log("[AUTH] Logging out – clearing token");
  await SecureStore.deleteItemAsync("token");
};

export interface UserProfile {
  id: string;
  name: string;
  login: string;
  email: string | null;
  phoneNumber?: string | null;
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
  phoneNumber?: string;
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
  console.log(res.data);

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

export interface PaginationOptions {
  limit?: number;
  before?: string;
}

export interface FullChatWithPagination extends FullChat {
  hasMore?: boolean;
}

export const getChatById = async (
  chatId: string,
  options?: PaginationOptions,
): Promise<FullChatWithPagination> => {
  console.log("[CHAT] Loading chat:", chatId, "options:", options);
  const params = new URLSearchParams();
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.before) params.append("before", options.before);

  const queryString = params.toString();
  const url = `/api/chats/${chatId}${queryString ? `?${queryString}` : ""}`;

  const res = await api.get<FullChatWithPagination>(url);
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
    phoneNumber?: string | null;
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
      await SecureStore.setItemAsync("token", res.data.token);
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

export interface Contact {
  id: string;
  name: string;
  login: string;
  avatar: string;
  phoneNumber?: string;
  isOnline: boolean;
  isFavorite?: boolean;
  isBlocked?: boolean;
  addedAt?: string;
}

export interface SyncContactsPayload {
  phoneNumbers: string[];
}

export interface SyncContactsResponse {
  users: Contact[];
}

export interface AddContactPayload {
  contactId: string;
  username?: string;
}

export interface RemoveContactPayload {
  contactId: string;
}

export interface ToggleFavoritePayload {
  contactId: string;
}

export interface ToggleBlockPayload {
  contactId: string;
}

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getContacts = async () => {
  try {
    const headers = await getAuthHeaders();

    console.log("[API] GET /contacts");

    const response = await fetch(`${API_BASE_URL}/api/contacts`, {
      method: "GET",
      headers,
    });

    console.log("[API] Response status:", response.status);

    if (response.status === 401) {
      await SecureStore.deleteItemAsync("token");
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to get contacts");
    }

    const data = await response.json();
    return data.contacts || [];
  } catch (error) {
    console.error("[API] getContacts error:", error);
    throw error;
  }
};

export const syncContacts = async (phoneNumbers: string[]) => {
  try {
    const headers = await getAuthHeaders();

    console.log("[API] POST /contacts/sync");
    console.log("[API] Syncing", phoneNumbers.length, "phone numbers");

    const response = await fetch(`${API_BASE_URL}/api/contacts/sync`, {
      method: "POST",
      headers,
      body: JSON.stringify({ phoneNumbers }),
    });

    console.log("[API] Response status:", response.status);

    if (response.status === 401) {
      await SecureStore.deleteItemAsync("token");
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to sync contacts");
    }

    const data = await response.json();
    console.log("[API] Synced users:", data.users?.length || 0);
    return data.users || [];
  } catch (error) {
    console.error("[API] syncContacts error:", error);
    throw error;
  }
};

export const addContact = async (contactId: string, nickname?: string) => {
  try {
    const headers = await getAuthHeaders();

    console.log("[API] POST /contacts/add");

    const response = await fetch(`${API_BASE_URL}/api/contacts/add`, {
      method: "POST",
      headers,
      body: JSON.stringify({ contactId, nickname }),
    });

    if (response.status === 401) {
      await SecureStore.deleteItemAsync("token");
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to add contact");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API] addContact error:", error);
    throw error;
  }
};

export const removeContact = async (contactId: string) => {
  try {
    const headers = await getAuthHeaders();

    console.log("[API] POST /contacts/remove");

    const response = await fetch(`${API_BASE_URL}/api/contacts/remove`, {
      method: "POST",
      headers,
      body: JSON.stringify({ contactId }),
    });

    if (response.status === 401) {
      await SecureStore.deleteItemAsync("token");
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to remove contact");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API] removeContact error:", error);
    throw error;
  }
};

export const toggleFavorite = async (contactId: string) => {
  try {
    const headers = await getAuthHeaders();

    console.log("[API] POST /contacts/favorite");

    const response = await fetch(`${API_BASE_URL}/api/contacts/favorite`, {
      method: "POST",
      headers,
      body: JSON.stringify({ contactId }),
    });

    if (response.status === 401) {
      await SecureStore.deleteItemAsync("token");
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to toggle favorite");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API] toggleFavorite error:", error);
    throw error;
  }
};

export const toggleBlock = async (contactId: string) => {
  try {
    const headers = await getAuthHeaders();

    console.log("[API] POST /contacts/block");

    const response = await fetch(`${API_BASE_URL}/api/contacts/block`, {
      method: "POST",
      headers,
      body: JSON.stringify({ contactId }),
    });

    if (response.status === 401) {
      await SecureStore.deleteItemAsync("token");
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to toggle block");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API] toggleBlock error:", error);
    throw error;
  }
};

export interface UserStatus {
  userId: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string | null;
}

export interface BulkStatusResponse {
  statuses: UserStatus[];
}

/**
 * Get a single user's online status and last seen
 */
export const getUserStatus = async (userId: string): Promise<UserStatus> => {
  console.log("[API] Getting status for user:", userId);
  const res = await api.get<UserStatus>(`/api/users/${userId}/status`);
  return res.data;
};

/**
 * Get multiple users' statuses at once
 */
export const getBulkUserStatuses = async (
  userIds: string[],
): Promise<UserStatus[]> => {
  console.log("[API] Getting bulk statuses for", userIds.length, "users");
  const res = await api.post<BulkStatusResponse>("/api/users/status/bulk", {
    userIds,
  });
  return res.data.statuses;
};

/**
 * Update last seen privacy setting
 */
export const updateLastSeenPrivacy = async (
  setting: "everyone" | "contacts" | "nobody",
): Promise<{ message: string; privacySettings: any }> => {
  console.log("[API] Updating last seen privacy to:", setting);
  const res = await api.patch("/api/users/me/privacy", {
    lastSeen: setting,
  });
  return res.data;
};

/**
 * Update online status visibility
 */
export const updateOnlineStatusVisibility = async (
  show: boolean,
): Promise<{ message: string; privacySettings: any }> => {
  console.log("[API] Updating online status visibility to:", show);
  const res = await api.patch("/api/users/me/privacy", {
    onlineStatus: show,
  });
  return res.data;
};

export interface MediaItem {
  type: "image" | "video" | "link";
  url: string;
}

export interface Will {
  id: string;
  _id?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  media: MediaItem[];
  category:
    | "advice"
    | "experience"
    | "lesson"
    | "opinion"
    | "rule"
    | "news"
    | "update"
    | "announcement"
    | "promo"
    | "tip";
  tone:
    | "calm"
    | "strong"
    | "emotional"
    | "direct"
    | "motivational"
    | "informative"
    | "fun"
    | "serious"
    | "promotional";
  tags: string[];
  visibility: "public" | "followers" | "private";
  likesCount: number;
  sharesCount: number;
  commentsCount: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface WillsResponse {
  success: boolean;
  data: Will[];
  pagination: PaginationInfo;
}

export interface WillResponse {
  success: boolean;
  data: Will;
  message?: string;
}

export interface CreateWillPayload {
  content: string;
  category?:
    | "advice"
    | "belief"
    | "experience"
    | "lesson"
    | "opinion"
    | "rule"
    | "news"
    | "update"
    | "announcement"
    | "promo"
    | "tip";
  tone?:
    | "calm"
    | "strong"
    | "emotional"
    | "direct"
    | "motivational"
    | "informative"
    | "fun"
    | "serious"
    | "promotional";
  tags?: string[];
  visibility?: "public" | "followers" | "private";
  media?: MediaItem[];
}

export interface UpdateWillPayload {
  content?: string;
  category?:
    | "advice"
    | "belief"
    | "experience"
    | "lesson"
    | "opinion"
    | "rule"
    | "news"
    | "update"
    | "announcement"
    | "promo"
    | "tip";
  tone?:
    | "calm"
    | "strong"
    | "emotional"
    | "direct"
    | "motivational"
    | "informative"
    | "fun"
    | "serious"
    | "promotional";
  tags?: string[];
  visibility?: "public" | "followers" | "private";
  media?: MediaItem[];
}

export const getAllWills = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  tone?: string;
  tags?: string;
  authorId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<WillsResponse> => {
  console.log("[WILLS] Fetching wills with params:", params);
  const res = await api.get<WillsResponse>("/api/wills", { params });

  const data = res.data;
  data.data = data.data.map((will) => ({
    ...will,
    id: will.id || will._id,
  }));

  return data;
};

export const getWillById = async (willId: string): Promise<Will> => {
  console.log("[WILLS] Fetching will:", willId);
  const res = await api.get<WillResponse>(`/api/wills/${willId}`);
  return res.data.data;
};

export const getMyWills = async (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<WillsResponse> => {
  console.log("[WILLS] Fetching my wills");
  const res = await api.get<WillsResponse>("/api/wills/my/wills", { params });
  return res.data;
};

export const getWillsByAuthor = async (
  authorId: string,
  params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  },
): Promise<WillsResponse> => {
  console.log("[WILLS] Fetching wills by author:", authorId);
  const res = await api.get<WillsResponse>(`/api/wills/author/${authorId}`, {
    params,
  });
  return res.data;
};

export const createWill = async (data: CreateWillPayload): Promise<Will> => {
  console.log("[WILLS] Creating will");
  const res = await api.post<WillResponse>("/api/wills", data);
  return res.data.data;
};

export const createWillWithMedia = async (
  content: string,
  fileUri: string,
  fileName: string,
  mimeType: string,
  additionalData?: Partial<CreateWillPayload>,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
): Promise<Will> => {
  console.log("[WILLS] Creating will with media:", fileName);

  const formData = new FormData();
  formData.append("content", content);

  if (additionalData?.category) {
    formData.append("category", additionalData.category);
  }
  if (additionalData?.tone) {
    formData.append("tone", additionalData.tone);
  }
  if (additionalData?.visibility) {
    formData.append("visibility", additionalData.visibility);
  }
  if (additionalData?.tags && additionalData.tags.length > 0) {
    formData.append("tags", JSON.stringify(additionalData.tags));
  }

  formData.append("file", {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as any);

  const res = await api.post<WillResponse>("/api/wills", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
    timeout: 60000,
  });

  console.log("[WILLS] Will created with media");
  return res.data.data;
};

export const updateWill = async (
  willId: string,
  data: UpdateWillPayload,
): Promise<Will> => {
  console.log("[WILLS] Updating will:", willId);
  const res = await api.put<WillResponse>(`/api/wills/${willId}`, data);
  return res.data.data;
};

export const deleteWill = async (
  willId: string,
): Promise<{ success: boolean; message: string }> => {
  console.log("[WILLS] Deleting will:", willId);
  const res = await api.delete<{ success: boolean; message: string }>(
    `/api/wills/${willId}`,
  );
  return res.data;
};

export const likeWill = async (willId: string): Promise<Will> => {
  console.log("[WILLS] Liking will:", willId);
  const res = await api.post<WillResponse>(`/api/wills/${willId}/like`);
  return res.data.data;
};

export const unlikeWill = async (willId: string): Promise<Will> => {
  console.log("[WILLS] Unliking will:", willId);
  const res = await api.delete<WillResponse>(`/api/wills/${willId}/like`);
  return res.data.data;
};

export const shareWill = async (willId: string): Promise<Will> => {
  console.log("[WILLS] Sharing will:", willId);
  const res = await api.post<WillResponse>(`/api/wills/${willId}/share`);
  return res.data.data;
};

export const togglePinWill = async (willId: string): Promise<Will> => {
  console.log("[WILLS] Toggling pin for will:", willId);
  const res = await api.patch<WillResponse>(`/api/wills/${willId}/pin`);
  return res.data.data;
};

export const getWillsByCategory = async (
  category: string,
  params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  },
): Promise<WillsResponse> => {
  console.log("[WILLS] Fetching wills by category:", category);
  const res = await api.get<WillsResponse>(`/api/wills/category/${category}`, {
    params,
  });
  return res.data;
};

export const getWillsByTags = async (
  tags: string[],
  params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  },
): Promise<WillsResponse> => {
  console.log("[WILLS] Fetching wills by tags:", tags);
  const res = await api.get<WillsResponse>("/api/wills/filter/tags", {
    params: { ...params, tags: tags.join(",") },
  });
  return res.data;
};
export const sendVoiceMessage = async (
  voiceUri: string,
  duration: number,
  chatId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setUploading: (uploading: boolean) => void,
  flatListRef?: React.RefObject<any>,
): Promise<void> => {
  try {
    console.log("[VoiceUpload] Starting upload:", {
      voiceUri,
      duration,
      chatId,
    });
    setUploading(true);

    // Create optimistic message
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      senderTitle: "You",
      senderId: "current-user",
      type: "voice",
      content: "",
      mediaUrl: voiceUri,
      duration,
      time: new Date().toISOString(),
      isRead: false,
    };

    // Add optimistic message to UI
    setMessages((prev) => [...prev, optimisticMessage]);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef?.current?.scrollToEnd({ animated: true });
    }, 100);

    // Generate filename with timestamp
    const timestamp = Date.now();
    const filename = `voice_${timestamp}.m4a`;

    console.log("[VoiceUpload] Uploading voice file...");

    // Upload using the existing API function
    const uploadedMessage = await sendFileMessage(
      chatId,
      voiceUri,
      filename,
      "audio/m4a",
      "voice",
      (progressEvent) => {
        const percentCompleted = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        console.log(`[VoiceUpload] Progress: ${percentCompleted}%`);
      },
    );

    console.log("[VoiceUpload] Upload successful:", uploadedMessage);

    // Remove optimistic message (the real one will come via socket or is already returned)
    setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));

    // If the backend doesn't auto-broadcast via socket, we can add the message directly
    // Otherwise, socket will handle it
    if (!uploadedMessage.id.startsWith("temp-")) {
      setMessages((prev) => {
        // Check if message already exists (from socket)
        if (prev.some((msg) => msg.id === uploadedMessage.id)) {
          return prev;
        }
        return [...prev, uploadedMessage];
      });
    }

    console.log("[VoiceUpload] Voice message sent successfully");
  } catch (error) {
    console.error("[VoiceUpload] Error:", error);

    // Remove optimistic message on error
    setMessages((prev) =>
      prev.filter((msg) => !msg.id.startsWith("optimistic-")),
    );

    throw error;
  } finally {
    setUploading(false);
  }
};

/**
 * Format duration in seconds to MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
