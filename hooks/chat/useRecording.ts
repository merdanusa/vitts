import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const recordingAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimation, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      recordingAnimation.setValue(1);
    }
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    console.log("Recording started");
  };

  const stopRecording = () => {
    setIsRecording(false);
    console.log("Recording stopped");
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    recordingAnimation,
  };
};
