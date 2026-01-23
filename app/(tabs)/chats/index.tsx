import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ChatListItem, getCurrentUser, getMyChats } from "@/services/api";
import { useNavigation } from "@react-navigation/native";
import { Camera, CheckCheck, Edit, Search } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView } from "react-native";

const ChatsScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const loadChats = async () => {
    try {
      const [chatsData, userData] = await Promise.all([
        getMyChats(),
        getCurrentUser(),
      ]);
      setChats(chatsData);
      setCurrentUserId(userData.id);
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.participant.login?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatTime = (timeString: string) => {
    const messageDate = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString("en-US", { weekday: "long" });
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getMessagePreview = (chat: ChatListItem) => {
    if (!chat.lastMessage) return "Tap to start chatting";

    const { content, type, senderId } = chat.lastMessage;
    const isSentByMe = senderId === currentUserId;
    const prefix = isSentByMe ? "You: " : "";

    switch (type) {
      case "image":
        return `${prefix}📷 Photo`;
      case "video":
        return `${prefix}🎥 Video`;
      case "voice":
      case "audio":
        return `${prefix}🎤 Voice message`;
      case "document":
        return `${prefix}📄 Document`;
      case "location":
        return `${prefix}📍 Location`;
      case "contact":
        return `${prefix}👤 Contact`;
      case "poll":
        return `${prefix}📊 Poll`;
      case "sticker":
        return `${prefix}Sticker`;
      case "deleted":
        return `${prefix}This message was deleted`;
      case "system":
        return content || "System message";
      default:
        return `${prefix}${content}`;
    }
  };

  const getMessageStatus = (chat: ChatListItem) => {
    if (!chat.lastMessage || chat.lastMessage.senderId !== currentUserId) {
      return null;
    }

    const status = chat.lastMessage.isRead ? "read" : "delivered";

    if (status === "read") {
      return <CheckCheck size={16} color="#0095f6" />;
    } else {
      return <CheckCheck size={16} color="#8e8e8e" />;
    }
  };

  const isUnread = (chat: ChatListItem) => {
    if (!chat.lastMessage) return false;
    return (
      chat.lastMessage.senderId !== currentUserId && !chat.lastMessage.isRead
    );
  };

  const handleChatPress = (chatId: string) => {
    navigation.navigate("ChatDetail" as never, { chatId } as never);
  };

  const handleNewChat = () => {
    navigation.navigate("NewChat" as never);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-white">
        <VStack className="flex-1 items-center justify-center">
          <Spinner size="large" />
          <Text className="mt-4 text-gray-500">Loading chats...</Text>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <VStack className="flex-1">
        {/* Header */}
        <HStack className="px-4 py-3 justify-between items-center">
          <Text className="text-3xl font-bold text-gray-900">Chats</Text>
          <HStack className="gap-4">
            <Pressable className="active:opacity-70">
              <Camera size={24} color="#000" />
            </Pressable>
            <Pressable className="active:opacity-70" onPress={handleNewChat}>
              <Edit size={24} color="#000" />
            </Pressable>
          </HStack>
        </HStack>

        {/* Search Bar */}
        <Box className="px-4 pb-3">
          <Input className="rounded-xl bg-gray-100 border-0">
            <InputSlot className="pl-3">
              <InputIcon as={Search} className="text-gray-500" size="sm" />
            </InputSlot>
            <InputField
              placeholder="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="text-base"
            />
          </Input>
        </Box>

        {/* Chat List */}
        {filteredChats.length === 0 ? (
          <VStack className="flex-1 items-center justify-center px-8">
            <Text className="text-gray-400 text-center text-lg">
              {searchQuery ? "No chats found" : "No chats yet"}
            </Text>
            {!searchQuery && (
              <Text className="text-gray-400 text-center mt-2">
                Tap the edit icon to start a new conversation
              </Text>
            )}
          </VStack>
        ) : (
          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredChats.map((chat, index) => {
              const unread = isUnread(chat);
              const messageStatus = getMessageStatus(chat);

              return (
                <Pressable
                  key={chat.id}
                  className="active:bg-gray-50"
                  onPress={() => handleChatPress(chat.id)}
                >
                  <HStack className="px-4 py-3 items-center gap-3">
                    {/* Avatar with online indicator */}
                    <Box className="relative">
                      <Avatar size="lg">
                        <AvatarFallbackText>
                          {chat.participant.name}
                        </AvatarFallbackText>
                        <AvatarImage
                          source={{ uri: chat.participant.avatar }}
                        />
                      </Avatar>
                      {chat.participant.isOnline && (
                        <Box className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </Box>

                    {/* Chat Info */}
                    <VStack className="flex-1 gap-1">
                      <HStack className="justify-between items-center">
                        <Text className="font-semibold text-gray-900 text-base">
                          {chat.participant.name}
                        </Text>
                        {chat.lastMessage && (
                          <Text className="text-gray-500 text-xs">
                            {formatTime(chat.lastMessage.time)}
                          </Text>
                        )}
                      </HStack>
                      <HStack className="justify-between items-center gap-2">
                        <HStack className="flex-1 items-center gap-1">
                          {messageStatus && (
                            <Box className="mr-1">{messageStatus}</Box>
                          )}
                          <Text
                            className={`text-sm flex-1 ${
                              unread
                                ? "text-gray-900 font-semibold"
                                : "text-gray-500"
                            }`}
                            numberOfLines={1}
                          >
                            {getMessagePreview(chat)}
                          </Text>
                        </HStack>
                        {unread && (
                          <Box className="bg-blue-500 rounded-full w-2 h-2" />
                        )}
                      </HStack>
                    </VStack>
                  </HStack>

                  {/* Divider */}
                  {index < filteredChats.length - 1 && (
                    <Box className="h-px bg-gray-100 ml-20" />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </VStack>
    </SafeAreaView>
  );
};

export default ChatsScreen;
