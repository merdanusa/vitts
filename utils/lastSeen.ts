/**
 * Format last seen time for display in React Native
 * @param lastSeenDate - The last seen timestamp
 * @returns Formatted last seen string
 */
export function formatLastSeen(lastSeenDate: Date | string | null): string {
  if (!lastSeenDate) return "Last seen recently";

  const now = new Date();
  const lastSeen = new Date(lastSeenDate);
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Less than 1 minute
  if (diffMinutes < 1) {
    return "Last seen just now";
  }

  // Less than 1 hour
  if (diffMinutes < 60) {
    return `Last seen ${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  // Less than 24 hours
  if (diffHours < 24) {
    return `Last seen ${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  }

  // Less than 7 days
  if (diffDays < 7) {
    return `Last seen ${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  }

  // More than 7 days - show date
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  // If it's from a different year, include the year
  if (lastSeen.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }

  return `Last seen ${lastSeen.toLocaleDateString("en-US", options)}`;
}

/**
 * Get last seen or online status
 * @param isOnline - Whether user is currently online
 * @param lastSeenDate - The last seen timestamp
 * @returns Status string
 */
export function getOnlineStatus(
  isOnline: boolean,
  lastSeenDate: Date | string | null,
): string {
  if (isOnline) {
    return "Online";
  }
  return formatLastSeen(lastSeenDate);
}

/**
 * Format time for chat list (shorter version)
 * @param lastSeenDate - The last seen timestamp
 * @returns Short formatted string
 */
export function formatLastSeenShort(
  lastSeenDate: Date | string | null,
): string {
  if (!lastSeenDate) return "";

  const now = new Date();
  const lastSeen = new Date(lastSeenDate);
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return lastSeen.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get status color for styling
 * @param isOnline - Whether user is currently online
 * @returns Color string
 */
export function getStatusColor(isOnline: boolean): string {
  return isOnline ? "#10b981" : "#6b7280"; // green-500 : gray-500
}
