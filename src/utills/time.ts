export function formatDate(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);

  // Today → show time
  if (date >= startOfToday) {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Yesterday
  if (date >= startOfYesterday) {
    return "Yesterday";
  }

  // Older → show date
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


export function lastSeenOfUser(isoString: string | null): string {
  if (!isoString) return "Offline";

  const lastSeen = new Date(isoString);
  const now = new Date();

  const diffMs = now.getTime() - lastSeen.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // ✅ Today
  if (diffDays === 0) {
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    return `${diffHours} hours ago`;
  }

  // ✅ Yesterday
  if (diffDays === 1) {
    return "Yesterday";
  }

  // ✅ Within a week
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  // ✅ Older → show date
  return lastSeen.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const getChatDateLabel = (dateString: string) => {
  const msgDate = new Date(dateString)
  const now = new Date()

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )

  const startOfMsgDay = new Date(
    msgDate.getFullYear(),
    msgDate.getMonth(),
    msgDate.getDate()
  )

  const diffDays =
    (startOfToday.getTime() - startOfMsgDay.getTime()) /
    (1000 * 60 * 60 * 24)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'

  return msgDate.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}