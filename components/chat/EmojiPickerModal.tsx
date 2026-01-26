import {
  EMOJI_CATEGORIES,
  FREQUENT_EMOJIS,
  getCategoryKeys,
} from "@/constants/emojis";
import { X } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface EmojiPickerModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

const { width } = Dimensions.get("window");
const EMOJI_SIZE = (width - 32) / 8;

export const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({
  visible,
  isDark,
  onClose,
  onSelect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("smileys");
  const scrollViewRef = useRef<ScrollView>(null);
  const categoryScrollRef = useRef<ScrollView>(null);
  const categoryPositions = useRef<{ [key: string]: number }>({});

  const categories = getCategoryKeys();

  const handleCategoryPress = (category: string, index: number) => {
    setSelectedCategory(category);
    const position = categoryPositions.current[category];
    if (position !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: position, animated: true });
    }

    // Scroll category tabs
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollTo({
        x: index * 52 - 100,
        animated: true,
      });
    }
  };

  const handleEmojiPress = (emoji: string) => {
    onSelect(emoji);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-end",
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={{ flex: 1 }}
        />

        <View
          style={{
            backgroundColor: isDark ? "#000000" : "#ffffff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: "70%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 12,
            elevation: 20,
          }}
        >
          {/* Handle Bar */}
          <View
            style={{
              alignItems: "center",
              paddingTop: 12,
              paddingBottom: 8,
            }}
          >
            <View
              style={{
                width: 36,
                height: 5,
                borderRadius: 3,
                backgroundColor: isDark ? "#48484a" : "#d1d1d6",
              }}
            />
          </View>

          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderBottomWidth: 0.33,
              borderBottomColor: isDark ? "#38383a" : "#c6c6c8",
            }}
          >
            <Text
              style={{
                color: isDark ? "#ffffff" : "#000000",
                fontSize: 20,
                fontWeight: "700",
                letterSpacing: 0.3,
              }}
            >
              Emoji
            </Text>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isDark ? "#1c1c1e" : "#f2f2f7",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <X
                size={20}
                color={isDark ? "#ffffff" : "#000000"}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
          </View>

          {/* Emoji Grid */}
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 20,
              paddingBottom: 120,
            }}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
          >
            {/* Frequent Section */}
            <View
              style={{ marginBottom: 32 }}
              onLayout={(event) => {
                categoryPositions.current["frequent"] =
                  event.nativeEvent.layout.y;
              }}
            >
              <Text
                style={{
                  color: isDark ? "#98989d" : "#6e6e73",
                  fontSize: 13,
                  fontWeight: "600",
                  marginBottom: 16,
                  marginLeft: 4,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Frequently Used
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {FREQUENT_EMOJIS.map((emoji, index) => (
                  <TouchableOpacity
                    key={`frequent-${index}`}
                    activeOpacity={0.5}
                    onPress={() => handleEmojiPress(emoji)}
                    style={{
                      width: EMOJI_SIZE,
                      height: EMOJI_SIZE,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 32 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category Sections */}
            {categories.map((category) => {
              const cat = EMOJI_CATEGORIES[category];
              return (
                <View
                  key={category}
                  style={{ marginBottom: 32 }}
                  onLayout={(event) => {
                    categoryPositions.current[category] =
                      event.nativeEvent.layout.y;
                  }}
                >
                  <Text
                    style={{
                      color: isDark ? "#98989d" : "#6e6e73",
                      fontSize: 13,
                      fontWeight: "600",
                      marginBottom: 16,
                      marginLeft: 4,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    {cat.title}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                    }}
                  >
                    {cat.emojis.map((emoji, index) => (
                      <TouchableOpacity
                        key={`${category}-${index}`}
                        activeOpacity={0.5}
                        onPress={() => handleEmojiPress(emoji)}
                        style={{
                          width: EMOJI_SIZE,
                          height: EMOJI_SIZE,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ fontSize: 32 }}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Category Tabs - Fixed Bottom */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: isDark ? "#000000" : "#f2f2f7",
              borderTopWidth: 0.33,
              borderTopColor: isDark ? "#38383a" : "#c6c6c8",
              paddingBottom: Platform.OS === "ios" ? 34 : 16,
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
              {/* Frequent Tab */}
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => handleCategoryPress("frequent", -1)}
                style={{
                  width: 48,
                  height: 48,
                  marginRight: 4,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 14,
                  backgroundColor:
                    selectedCategory === "frequent"
                      ? isDark
                        ? "#1c1c1e"
                        : "#ffffff"
                      : "transparent",
                }}
              >
                <Text style={{ fontSize: 26 }}>🕐</Text>
              </TouchableOpacity>

              {/* Category Tabs */}
              {categories.map((category, index) => {
                const cat = EMOJI_CATEGORIES[category];
                const isSelected = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    activeOpacity={0.6}
                    onPress={() => handleCategoryPress(category, index)}
                    style={{
                      width: 48,
                      height: 48,
                      marginRight: 4,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 14,
                      backgroundColor: isSelected
                        ? isDark
                          ? "#1c1c1e"
                          : "#ffffff"
                        : "transparent",
                    }}
                  >
                    <Text style={{ fontSize: 26 }}>{cat.icon}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};
