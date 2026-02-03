import {
  EMOJI_CATEGORIES,
  FREQUENT_EMOJIS,
  getCategoryKeys,
} from "@/constants/emojis";
import { Search, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const EMOJI_SIZE = (SCREEN_WIDTH - 32) / 8;

interface EmojiPickerModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

const EmojiButton: React.FC<{
  emoji: string;
  onPress: (emoji: string) => void;
}> = React.memo(({ emoji, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 1.3,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={() => onPress(emoji)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ width: EMOJI_SIZE, height: EMOJI_SIZE }}
      className="items-center justify-center"
    >
      <Animated.Text className="text-[32px]" style={{ transform: [{ scale }] }}>
        {emoji}
      </Animated.Text>
    </Pressable>
  );
});

export const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({
  visible,
  isDark,
  onClose,
  onSelect,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("smileys");
  const [searchQuery, setSearchQuery] = useState("");

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const categoryScrollRef = useRef<ScrollView>(null);
  const categoryPositions = useRef<{ [key: string]: number }>({});

  const categories = getCategoryKeys();

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
      setSearchQuery("");
    }
  }, [visible]);

  const handleCategoryPress = useCallback((category: string, index: number) => {
    setSelectedCategory(category);
    const position = categoryPositions.current[category];
    if (position !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: position, animated: true });
    }
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollTo({
        x: index * 52 - 100,
        animated: true,
      });
    }
  }, []);

  const handleEmojiPress = useCallback(
    (emoji: string) => {
      onSelect(emoji);
      onClose();
    },
    [onSelect, onClose],
  );

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
          className="absolute inset-0 bg-black/40"
          style={{ opacity: backdropOpacity }}
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View
          className={`rounded-t-3xl shadow-2xl ${isDark ? "bg-neutral-900" : "bg-white"}`}
          style={{
            transform: [{ translateY: slideAnim }],
            height: SCREEN_HEIGHT * 0.65,
            maxHeight: 500,
          }}
        >
          <View className="items-center pt-3 pb-2">
            <View
              className={`w-9 h-[5px] rounded-full ${isDark ? "bg-neutral-700" : "bg-neutral-300"}`}
            />
          </View>

          <View
            className={`flex-row items-center justify-between px-5 py-3 border-b ${isDark ? "border-white/10" : "border-black/5"}`}
          >
            <Text
              className={`text-xl font-bold tracking-tight ${isDark ? "text-neutral-100" : "text-neutral-900"}`}
            >
              Emoji
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

          <View
            className={`mx-4 mt-3 flex-row items-center rounded-xl px-3 ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
          >
            <Search size={18} color={isDark ? "#71717a" : "#a1a1aa"} />
            <TextInput
              className={`flex-1 py-2.5 px-2 text-[15px] ${isDark ? "text-white" : "text-neutral-900"}`}
              placeholder="Search emoji"
              placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View
              className="mb-8"
              onLayout={(e) => {
                categoryPositions.current["frequent"] = e.nativeEvent.layout.y;
              }}
            >
              <Text
                className={`text-[13px] font-semibold mb-4 ml-1 uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
              >
                Frequently Used
              </Text>
              <View className="flex-row flex-wrap">
                {FREQUENT_EMOJIS.map((emoji, index) => (
                  <EmojiButton
                    key={`frequent-${index}`}
                    emoji={emoji}
                    onPress={handleEmojiPress}
                  />
                ))}
              </View>
            </View>

            {categories.map((category) => {
              const cat = EMOJI_CATEGORIES[category];
              return (
                <View
                  key={category}
                  className="mb-8"
                  onLayout={(e) => {
                    categoryPositions.current[category] =
                      e.nativeEvent.layout.y;
                  }}
                >
                  <Text
                    className={`text-[13px] font-semibold mb-4 ml-1 uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
                  >
                    {cat.title}
                  </Text>
                  <View className="flex-row flex-wrap">
                    {cat.emojis.map((emoji, index) => (
                      <EmojiButton
                        key={`${category}-${index}`}
                        emoji={emoji}
                        onPress={handleEmojiPress}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View
            className={`absolute bottom-0 left-0 right-0 border-t ${isDark ? "bg-neutral-900 border-white/10" : "bg-neutral-50 border-black/5"}`}
            style={{
              paddingBottom: Platform.OS === "ios" ? insets.bottom : 16,
              paddingTop: 12,
            }}
          >
            <ScrollView
              ref={categoryScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={() => handleCategoryPress("frequent", -1)}
                className={`w-12 h-12 mr-1 items-center justify-center rounded-xl ${
                  selectedCategory === "frequent"
                    ? isDark
                      ? "bg-neutral-800"
                      : "bg-white"
                    : ""
                }`}
              >
                <Text className="text-[26px]">🕐</Text>
              </Pressable>

              {categories.map((category, index) => {
                const cat = EMOJI_CATEGORIES[category];
                const isSelected = selectedCategory === category;
                return (
                  <Pressable
                    key={category}
                    onPress={() => handleCategoryPress(category, index)}
                    className={`w-12 h-12 mr-1 items-center justify-center rounded-xl ${
                      isSelected ? (isDark ? "bg-neutral-800" : "bg-white") : ""
                    }`}
                  >
                    <Text className="text-[26px]">{cat.icon}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
