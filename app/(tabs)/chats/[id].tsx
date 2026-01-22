import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const ChatScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HStack>
        <Text>ChatScreen</Text>
      </HStack>
    </SafeAreaView>
  );
};

export default ChatScreen;
