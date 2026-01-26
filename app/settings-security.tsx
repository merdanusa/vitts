import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const SecurityScreen = () => {
  return (
    <SafeAreaView>
      <HStack>
        <Text>SecurityScreen</Text>
      </HStack>
    </SafeAreaView>
  );
};

export default SecurityScreen;
