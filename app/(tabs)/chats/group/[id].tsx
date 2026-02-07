import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { AttachmentModal } from "@/components/chat/AttachmentModal";
import { ChatInput } from "@/components/chat/ChatInput";
import { EmojiPickerModal } from "@/components/chat/EmojiPickerModal";
import { GroupChatHeader } from "@/components/chat/GroupChatHeader";
import { LoadingView } from "@/components/chat/LoadingView";
import { MessagesList } from "@/components/chat/MessagesList";
import { RecordingIndicator } from "@/components/chat/RecordingIndicator";
import { ReplyPreview } from "@/components/chat/ReplyPreview";
import { UploadIndicator } from "@/components/chat/UploadIndicator";
import { ImageBackground } from "@/components/ui/image-background";
import { useChatScreen } from "@/hooks/chat/useChatScreen";
import { selectTypingUsers } from "@/store/chatSlice";

const GroupChatDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    isDark,
    bgImage,
    isMounted,
    inputText,
    showEmojiPicker,
    showAttachMenu,
    uploading,
    keyboardVisible,
    replyingTo,
    isRecording,
    recordingDuration,
    recordingAnimation,
    loading,
    loadingMore,
    hasMore,
    messages,
    chatData,
    currentUserId,
    flatListRef,
    handleSend,
    handleEmojiSelect,
    handleInputChange,
    handleImagePick,
    handleCameraPick,
    handleDocumentPick,
    handleStopRecording,
    handleCancelRecording,
    handleMessageLongPress,
    startRecording,
    loadMoreMessages,
    openEmojiPicker,
    closeEmojiPicker,
    openAttachMenu,
    closeAttachMenu,
    clearReply,
  } = useChatScreen(id);

  const typingUserIds = useSelector(selectTypingUsers(id));

  const handleVoiceCall = () =>
    Alert.alert("Voice Call", "Starting group voice call...");
  const handleVideoCall = () =>
    Alert.alert("Video Call", "Starting group video call...");
  const handleMoreOptions = () =>
    Alert.alert("Options", "Additional options...");

  const handleGroupInfoPress = () => {
    router.push(`/chats/group-info/${id}`);
  };

  if (loading || !isMounted) return <LoadingView isDark={isDark} />;

  return (
    <View className={`flex-1 ${isDark ? "bg-[#0a0a0a]" : "bg-[#efeae2]"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <ImageBackground
        source={bgImage}
        className="flex-1"
        resizeMode="repeat"
        imageStyle={{ opacity: isDark ? 0.03 : 0.06 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          className="flex-1"
        >
          <View className="absolute top-0 left-0 right-0 z-50">
            {Platform.OS === "ios" ? (
              <BlurView
                intensity={isDark ? 80 : 90}
                tint={isDark ? "dark" : "light"}
                className="overflow-hidden"
              >
                <SafeAreaView edges={["top"]}>
                  <GroupChatHeader
                    isDark={isDark}
                    groupName={chatData?.name || "Group"}
                    groupAvatar={chatData?.avatar}
                    participantCount={chatData?.participants?.length || 0}
                    participants={chatData?.participants || []}
                    typingUsers={typingUserIds}
                    onBack={() => router.back()}
                    onGroupInfoPress={handleGroupInfoPress}
                    onVoiceCall={handleVoiceCall}
                    onVideoCall={handleVideoCall}
                    onMoreOptions={handleMoreOptions}
                  />
                </SafeAreaView>
              </BlurView>
            ) : (
              <View className={isDark ? "bg-[#121212]/97" : "bg-white/97"}>
                <SafeAreaView edges={["top"]}>
                  <GroupChatHeader
                    isDark={isDark}
                    groupName={chatData?.name || "Group"}
                    groupAvatar={chatData?.avatar}
                    participantCount={chatData?.participants?.length || 0}
                    participants={chatData?.participants || []}
                    typingUsers={typingUserIds}
                    onBack={() => router.back()}
                    onGroupInfoPress={handleGroupInfoPress}
                    onVoiceCall={handleVoiceCall}
                    onVideoCall={handleVideoCall}
                    onMoreOptions={handleMoreOptions}
                  />
                </SafeAreaView>
              </View>
            )}
          </View>

          <View className="flex-1">
            <MessagesList
              ref={flatListRef}
              messages={messages}
              currentUserId={currentUserId}
              isDark={isDark}
              isGroupChat={true}
              onLoadMore={loadMoreMessages}
              loadingMore={loadingMore}
              hasMore={hasMore}
              onMessageLongPress={handleMessageLongPress}
            />
          </View>

          {uploading && <UploadIndicator isDark={isDark} />}

          {isRecording && (
            <RecordingIndicator
              isDark={isDark}
              recordingAnimation={recordingAnimation}
              recordingDuration={recordingDuration}
              onStop={handleStopRecording}
              onCancel={handleCancelRecording}
            />
          )}

          {replyingTo && (
            <ReplyPreview
              message={replyingTo}
              isDark={isDark}
              onClose={clearReply}
            />
          )}

          <ChatInput
            isDark={isDark}
            keyboardVisible={keyboardVisible}
            inputText={inputText}
            uploading={uploading}
            isRecording={isRecording}
            onChangeText={handleInputChange}
            onSend={handleSend}
            onAttach={openAttachMenu}
            onEmoji={openEmojiPicker}
            onStartRecording={startRecording}
            onStopRecording={handleStopRecording}
          />

          <EmojiPickerModal
            visible={showEmojiPicker}
            isDark={isDark}
            onClose={closeEmojiPicker}
            onSelect={handleEmojiSelect}
          />

          <AttachmentModal
            visible={showAttachMenu}
            isDark={isDark}
            onClose={closeAttachMenu}
            onImagePick={handleImagePick}
            onCameraPick={handleCameraPick}
            onDocumentPick={handleDocumentPick}
          />
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default React.memo(GroupChatDetailScreen);
