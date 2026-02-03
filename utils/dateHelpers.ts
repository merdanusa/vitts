export const formatTime = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

export const getDateLabel = (timestamp: string | Date): string | null => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const resetTime = (date: Date) => {
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const messageDateReset = resetTime(new Date(messageDate));
  const todayReset = resetTime(new Date(today));
  const yesterdayReset = resetTime(new Date(yesterday));

  if (messageDateReset.getTime() === todayReset.getTime()) {
    return "Today";
  } else if (messageDateReset.getTime() === yesterdayReset.getTime()) {
    return "Yesterday";
  } else {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = months[messageDate.getMonth()];
    const day = messageDate.getDate();

    const getOrdinalSuffix = (day: number): string => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${month} ${day}${getOrdinalSuffix(day)}`;
  }
};

export const shouldShowDateHeader = (
  currentMessage: { time: string | Date },
  previousMessage: { time: string | Date } | null,
): boolean => {
  if (!previousMessage) return true;

  const currentDate = new Date(currentMessage.time);
  const previousDate = new Date(previousMessage.time);

  currentDate.setHours(0, 0, 0, 0);
  previousDate.setHours(0, 0, 0, 0);

  return currentDate.getTime() !== previousDate.getTime();
};
