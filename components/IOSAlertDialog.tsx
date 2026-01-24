import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface IOSAlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttons: AlertButton[];
  onDismiss?: () => void;
  isDark?: boolean;
}

export const IOSAlert: React.FC<IOSAlertProps> = ({
  visible,
  title,
  message,
  buttons,
  onDismiss,
  isDark = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 7,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const renderButtons = () => {
    if (buttons.length === 2) {
      return (
        <View className="flex-row">
          {buttons.map((button, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <View
                  style={{
                    width: 0.5,
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.15)",
                  }}
                />
              )}
              <TouchableOpacity
                className="flex-1 py-3 items-center justify-center"
                onPress={() => handleButtonPress(button)}
                activeOpacity={0.6}
              >
                <Text
                  className={`text-base ${
                    button.style === "cancel"
                      ? "font-semibold text-[#007AFF]"
                      : button.style === "destructive"
                        ? "text-[#FF3B30]"
                        : "text-[#007AFF]"
                  }`}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      );
    }

    return (
      <View>
        {buttons.map((button, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <View
                style={{
                  height: 0.5,
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.15)",
                }}
              />
            )}
            <TouchableOpacity
              className="py-3 items-center justify-center"
              onPress={() => handleButtonPress(button)}
              activeOpacity={0.6}
            >
              <Text
                className={`text-base ${
                  button.style === "cancel"
                    ? "font-semibold text-[#007AFF]"
                    : button.style === "destructive"
                      ? "text-[#FF3B30]"
                      : "text-[#007AFF]"
                }`}
              >
                {button.text}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          backgroundColor: isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.4)",
        }}
        className="flex-1 justify-center items-center"
      >
        <Pressable className="absolute inset-0" onPress={onDismiss} />
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
          className="w-[80%] max-w-[270px]"
        >
          <View
            style={{
              backgroundColor: isDark ? "#1c1c1e" : "#F9F9F9",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {title && (
              <Text
                style={{
                  color: isDark ? "#ffffff" : "#000000",
                  fontSize: 17,
                  fontWeight: "600",
                  textAlign: "center",
                  paddingTop: 20,
                  paddingHorizontal: 16,
                  paddingBottom: 4,
                }}
              >
                {title}
              </Text>
            )}
            {message && (
              <Text
                style={{
                  color: isDark ? "#ffffff" : "#000000",
                  fontSize: 13,
                  textAlign: "center",
                  paddingHorizontal: 16,
                  paddingTop: 4,
                  paddingBottom: 20,
                  lineHeight: 18,
                }}
              >
                {message}
              </Text>
            )}

            <View
              style={{
                height: 0.5,
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.15)",
              }}
            />

            {renderButtons()}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export const showIOSAlert = {
  simple: (title: string, message: string, onConfirm?: () => void) => ({
    title,
    message,
    buttons: [
      {
        text: "OK",
        style: "default" as const,
        onPress: onConfirm,
      },
    ],
  }),

  confirm: (
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void,
  ) => ({
    title,
    message,
    buttons: [
      {
        text: "Cancel",
        style: "cancel" as const,
        onPress: onCancel,
      },
      {
        text: "OK",
        style: "default" as const,
        onPress: onConfirm,
      },
    ],
  }),

  destructive: (
    title: string,
    message: string,
    confirmText: string,
    onConfirm?: () => void,
    onCancel?: () => void,
  ) => ({
    title,
    message,
    buttons: [
      {
        text: "Cancel",
        style: "cancel" as const,
        onPress: onCancel,
      },
      {
        text: confirmText,
        style: "destructive" as const,
        onPress: onConfirm,
      },
    ],
  }),

  multiOption: (
    title: string,
    message: string,
    options: {
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }[],
  ) => ({
    title,
    message,
    buttons: options,
  }),
};

export default IOSAlert;
