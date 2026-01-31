import { LinearGradient } from "expo-linear-gradient";
import {
  Camera,
  File,
  Headphones,
  Image as ImageIcon,
  MapPin,
  User,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AttachmentModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onImagePick: () => void;
  onCameraPick: () => void;
  onDocumentPick: () => void;
  onLocationPick?: () => void;
  onContactPick?: () => void;
  onAudioPick?: () => void;
}

interface AttachmentOptionProps {
  icon: React.ReactNode;
  label: string;
  gradient: [string, string];
  onPress: () => void;
  delay: number;
}

const AttachmentOption: React.FC<AttachmentOptionProps> = ({
  icon,
  label,
  gradient,
  onPress,
  delay,
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 200,
        friction: 15,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.9,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      className="w-1/3 items-center mb-5"
      style={{
        opacity,
        transform: [{ scale: Animated.multiply(scale, pressScale) }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="items-center"
      >
        <LinearGradient
          colors={gradient}
          className="w-[60px] h-[60px] rounded-2xl items-center justify-center mb-2.5 shadow-lg"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {icon}
        </LinearGradient>
        <Text className="text-[13px] font-medium text-neutral-500 tracking-wide">
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  visible,
  isDark,
  onClose,
  onImagePick,
  onCameraPick,
  onDocumentPick,
  onLocationPick,
  onContactPick,
  onAudioPick,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: SCREEN_HEIGHT,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const attachmentOptions = [
    {
      icon: <ImageIcon size={28} color="#fff" strokeWidth={2} />,
      label: "Gallery",
      gradient: ["#3b82f6", "#1d4ed8"] as [string, string],
      onPress: onImagePick,
    },
    {
      icon: <Camera size={28} color="#fff" strokeWidth={2} />,
      label: "Camera",
      gradient: ["#ec4899", "#db2777"] as [string, string],
      onPress: onCameraPick,
    },
    {
      icon: <File size={28} color="#fff" strokeWidth={2} />,
      label: "Document",
      gradient: ["#8b5cf6", "#7c3aed"] as [string, string],
      onPress: onDocumentPick,
    },
    {
      icon: <MapPin size={28} color="#fff" strokeWidth={2} />,
      label: "Location",
      gradient: ["#22c55e", "#16a34a"] as [string, string],
      onPress: onLocationPick || (() => {}),
    },
    {
      icon: <User size={28} color="#fff" strokeWidth={2} />,
      label: "Contact",
      gradient: ["#f59e0b", "#d97706"] as [string, string],
      onPress: onContactPick || (() => {}),
    },
    {
      icon: <Headphones size={28} color="#fff" strokeWidth={2} />,
      label: "Audio",
      gradient: ["#ef4444", "#dc2626"] as [string, string],
      onPress: onAudioPick || (() => {}),
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        <Animated.View
          className="absolute inset-0 bg-black/50"
          style={{ opacity: backdropOpacity }}
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View
          className={`rounded-t-3xl shadow-2xl ${isDark ? "bg-neutral-900" : "bg-white"}`}
          style={{
            transform: [{ translateY: slideAnim }],
            paddingBottom: Math.max(insets.bottom, 20),
          }}
        >
          <View className="items-center pt-3 pb-2">
            <View
              className={`w-10 h-1 rounded-full ${isDark ? "bg-neutral-700" : "bg-neutral-300"}`}
            />
          </View>

          <View
            className={`flex-row items-center justify-between px-5 py-3 border-b ${isDark ? "border-white/10" : "border-black/5"}`}
          >
            <Text
              className={`text-xl font-bold tracking-tight ${isDark ? "text-neutral-100" : "text-neutral-900"}`}
            >
              Share
            </Text>
            <Pressable
              onPress={onClose}
              className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
            >
              <X
                size={20}
                color={isDark ? "#a1a1aa" : "#71717a"}
                strokeWidth={2.5}
              />
            </Pressable>
          </View>

          <View className="flex-row flex-wrap px-4 pt-6 pb-3">
            {attachmentOptions.map((option, index) => (
              <AttachmentOption
                key={option.label}
                {...option}
                delay={index * 50}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
