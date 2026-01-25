import { useRef, useState } from "react";

export const useTypingIndicator = () => {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = (data: any, chatId: string, currentUserId: string) => {
    if (data.chatId === chatId && data.fromUserId !== currentUserId) {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    }
  };

  const handleStopTyping = (data: any, chatId: string) => {
    if (data.chatId === chatId) {
      setIsTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  return {
    isTyping,
    handleTyping,
    handleStopTyping,
  };
};
