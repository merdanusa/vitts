import {
  createAudioRecorder,
  RecordingOptions,
  AudioModule,
  setAudioModeAsync,
} from "expo-audio";
import { useEffect, useRef, useState } from "react";
import { Animated, Platform } from "react-native";

export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<ReturnType<
    typeof createAudioRecorder
  > | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingAnimation = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Request permissions on mount
    (async () => {
      try {
        const { granted } = await AudioModule.requestRecordingPermissionsAsync();
        if (!granted) {
          console.warn("Audio recording permission not granted");
        }
      } catch (error) {
        console.error("Error requesting audio permissions:", error);
      }
    })();

    return () => {
      // Cleanup on unmount
      if (recorder) {
        recorder.stop().catch(console.error);
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      // Start pulsing animation
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

  const startRecording = async () => {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        console.error("Audio recording permission denied");
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      const recordingOptions: RecordingOptions = {
        extension: ".m4a",
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        ...(Platform.OS === "android" && {
          outputFormat: "mpeg4",
          audioEncoder: "aac",
        }),
        ...(Platform.OS === "ios" && {
          outputFormat: "mpeg4aac",
          audioEncoder: "aac",
        }),
      };

      // Create and start recording
      const newRecorder = createAudioRecorder(recordingOptions);
      await newRecorder.record();

      setRecorder(newRecorder);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      durationInterval.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      console.log("[Recording] Started successfully");
    } catch (error) {
      console.error("[Recording] Failed to start:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = async (): Promise<{
    uri: string;
    duration: number;
  } | null> => {
    try {
      if (!recorder) {
        console.warn("[Recording] No active recording to stop");
        return null;
      }

      console.log("[Recording] Stopping...");

      // Stop the recording
      const uri = await recorder.stop();
      const duration = recordingDuration;

      // Reset audio mode
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      // Clear state
      setRecorder(null);
      setIsRecording(false);

      // Clear duration interval
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      console.log("[Recording] Stopped successfully:", { uri, duration });

      return uri ? { uri, duration } : null;
    } catch (error) {
      console.error("[Recording] Failed to stop:", error);
      setIsRecording(false);
      setRecorder(null);
      return null;
    } finally {
      setRecordingDuration(0);
    }
  };

  const cancelRecording = async () => {
    try {
      if (recorder) {
        await recorder.stop();
        setRecorder(null);
      }
      setIsRecording(false);
      setRecordingDuration(0);

      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      await setAudioModeAsync({
        allowsRecording: false,
      });

      console.log("[Recording] Cancelled");
    } catch (error) {
      console.error("[Recording] Failed to cancel:", error);
    }
  };

  return {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    recordingAnimation,
  };
};
