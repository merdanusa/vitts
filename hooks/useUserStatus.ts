import { socketService } from "@/services/socket";
import { useCallback, useEffect, useState } from "react";

interface UserStatus {
  isOnline: boolean;
  lastSeen: string | null;
}

interface UserStatusUpdate {
  userId: string;
  isOnline: boolean;
  lastSeen?: string | null;
  name?: string;
  avatar?: string;
  login?: string;
}

/**
 * Hook to manage user online status and last seen
 * @param userId - The user ID to track
 * @param initialIsOnline - Initial online status
 * @param initialLastSeen - Initial last seen timestamp
 */
export function useUserStatus(
  userId: string | null | undefined,
  initialIsOnline: boolean = false,
  initialLastSeen: string | null = null,
) {
  const [status, setStatus] = useState<UserStatus>({
    isOnline: initialIsOnline,
    lastSeen: initialLastSeen,
  });

  useEffect(() => {
    if (!userId) return;

    const handleStatusUpdate = (data: UserStatusUpdate) => {
      if (data.userId === userId) {
        setStatus({
          isOnline: data.isOnline,
          lastSeen: data.lastSeen || null,
        });
      }
    };

    socketService.on("userOnlineStatus", handleStatusUpdate);

    return () => {
      socketService.off("userOnlineStatus", handleStatusUpdate);
    };
  }, [userId]);

  // Update status when props change
  useEffect(() => {
    setStatus({
      isOnline: initialIsOnline,
      lastSeen: initialLastSeen,
    });
  }, [initialIsOnline, initialLastSeen]);

  return status;
}

/**
 * Hook to manage multiple users' statuses
 * @param userIds - Array of user IDs to track
 * @param initialStatuses - Initial status map
 */
export function useMultipleUserStatuses(
  userIds: string[],
  initialStatuses: Record<string, UserStatus> = {},
) {
  const [statuses, setStatuses] =
    useState<Record<string, UserStatus>>(initialStatuses);

  useEffect(() => {
    const handleStatusUpdate = (data: UserStatusUpdate) => {
      if (userIds.includes(data.userId)) {
        setStatuses((prev) => ({
          ...prev,
          [data.userId]: {
            isOnline: data.isOnline,
            lastSeen: data.lastSeen || null,
          },
        }));
      }
    };

    socketService.on("userOnlineStatus", handleStatusUpdate);

    return () => {
      socketService.off("userOnlineStatus", handleStatusUpdate);
    };
  }, [userIds]);

  const updateStatus = useCallback((userId: string, status: UserStatus) => {
    setStatuses((prev) => ({
      ...prev,
      [userId]: status,
    }));
  }, []);

  const getStatus = useCallback(
    (userId: string): UserStatus => {
      return (
        statuses[userId] || {
          isOnline: false,
          lastSeen: null,
        }
      );
    },
    [statuses],
  );

  return {
    statuses,
    updateStatus,
    getStatus,
  };
}
