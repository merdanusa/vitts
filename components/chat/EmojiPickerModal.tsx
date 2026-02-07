import {
  EMOJI_CATEGORIES,
  FREQUENT_EMOJIS,
  getCategoryKeys,
} from "@/constants/emojis";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Search } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const NUM_COLUMNS = 8;
const EMOJI_SIZE = (SCREEN_WIDTH - 32) / NUM_COLUMNS;
const ROW_HEIGHT = EMOJI_SIZE;

interface EmojiPickerModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

type EmojiRow =
  | { type: "header"; title: string; key: string }
  | { type: "row"; emojis: string[]; key: string };

const EmojiCell: React.FC<{
  emoji: string;
  onPress: (emoji: string) => void;
}> = React.memo(({ emoji, onPress }) => (
  <Pressable
    onPress={() => onPress(emoji)}
    style={{ width: EMOJI_SIZE, height: EMOJI_SIZE }}
    className="items-center justify-center"
  >
    <Text className="text-[32px]">{emoji}</Text>
  </Pressable>
));

// Pre-compute the flat list data for all emojis (done once at module level)
const buildEmojiData = (): EmojiRow[] => {
  const rows: EmojiRow[] = [];
  const categories = getCategoryKeys();

  // Frequently used
  rows.push({ type: "header", title: "Frequently Used", key: "header-frequent" });
  for (let i = 0; i < FREQUENT_EMOJIS.length; i += NUM_COLUMNS) {
    rows.push({
      type: "row",
      emojis: FREQUENT_EMOJIS.slice(i, i + NUM_COLUMNS),
      key: `frequent-${i}`,
    });
  }

  // All categories
  for (const category of categories) {
    const cat = EMOJI_CATEGORIES[category];
    rows.push({ type: "header", title: cat.title, key: `header-${category}` });
    for (let i = 0; i < cat.emojis.length; i += NUM_COLUMNS) {
      rows.push({
        type: "row",
        emojis: cat.emojis.slice(i, i + NUM_COLUMNS),
        key: `${category}-${i}`,
      });
    }
  }

  return rows;
};

const ALL_EMOJI_DATA = buildEmojiData();

// Pre-compute category header indices for scrolling
const buildCategoryIndices = (): Record<string, number> => {
  const indices: Record<string, number> = {};
  const categories = getCategoryKeys();
  for (let i = 0; i < ALL_EMOJI_DATA.length; i++) {
    const item = ALL_EMOJI_DATA[i];
    if (item.type === "header") {
      if (item.key === "header-frequent") {
        indices["frequent"] = i;
      } else {
        const catKey = item.key.replace("header-", "");
        if (categories.includes(catKey)) {
          indices[catKey] = i;
        }
      }
    }
  }
  return indices;
};

const CATEGORY_INDICES = buildCategoryIndices();

export const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({
  visible,
  isDark,
  onClose,
  onSelect,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("frequent");
  const [searchQuery, setSearchQuery] = useState("");

  const sheetRef = useRef<BottomSheet>(null);
  const flatListRef = useRef<any>(null);
  const categoryScrollRef = useRef<ScrollView>(null);

  const categories = useMemo(() => getCategoryKeys(), []);
  const snapPoints = useMemo(() => ["65%"], []);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
      setSearchQuery("");
    }
  }, [visible]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
      />
    ),
    [],
  );

  // Filter emoji data when searching
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return ALL_EMOJI_DATA;

    const query = searchQuery.toLowerCase();
    const matchedEmojis: string[] = [];

    // Search through all categories
    for (const category of categories) {
      const cat = EMOJI_CATEGORIES[category];
      for (const emoji of cat.emojis) {
        if (cat.title.toLowerCase().includes(query)) {
          matchedEmojis.push(emoji);
        }
      }
    }
    // Also search frequent
    for (const emoji of FREQUENT_EMOJIS) {
      if (!matchedEmojis.includes(emoji)) {
        matchedEmojis.push(emoji);
      }
    }

    if (matchedEmojis.length === 0) return [];

    const rows: EmojiRow[] = [
      { type: "header", title: "Search Results", key: "header-search" },
    ];
    for (let i = 0; i < matchedEmojis.length; i += NUM_COLUMNS) {
      rows.push({
        type: "row",
        emojis: matchedEmojis.slice(i, i + NUM_COLUMNS),
        key: `search-${i}`,
      });
    }
    return rows;
  }, [searchQuery, categories]);

  const handleEmojiPress = useCallback(
    (emoji: string) => {
      onSelect(emoji);
      onClose();
    },
    [onSelect, onClose],
  );

  const handleCategoryPress = useCallback(
    (category: string, index: number) => {
      setSelectedCategory(category);
      setSearchQuery("");

      const targetIndex = CATEGORY_INDICES[category];
      if (targetIndex !== undefined && flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: targetIndex,
          animated: true,
        });
      }
      if (categoryScrollRef.current) {
        categoryScrollRef.current.scrollTo({
          x: (index + 1) * 52 - 100,
          animated: true,
        });
      }
    },
    [],
  );

  const getItemLayout = useCallback(
    (_data: any, index: number) => {
      const item = filteredData[index];
      const height = item?.type === "header" ? 36 : ROW_HEIGHT;
      // Approximate offset
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += filteredData[i]?.type === "header" ? 36 : ROW_HEIGHT;
      }
      return { length: height, offset, index };
    },
    [filteredData],
  );

  const renderItem = useCallback(
    ({ item }: { item: EmojiRow }) => {
      if (item.type === "header") {
        return (
          <View className="pt-4 pb-2 px-1">
            <Text
              className={`text-[13px] font-semibold uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
            >
              {item.title}
            </Text>
          </View>
        );
      }

      return (
        <View className="flex-row">
          {item.emojis.map((emoji, i) => (
            <EmojiCell
              key={`${item.key}-${i}`}
              emoji={emoji}
              onPress={handleEmojiPress}
            />
          ))}
        </View>
      );
    },
    [isDark, handleEmojiPress],
  );

  const keyExtractor = useCallback((item: EmojiRow) => item.key, []);

  if (!visible) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChange}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: isDark ? "#171717" : "#ffffff",
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? "#404040" : "#d4d4d4",
        width: 36,
      }}
    >
      <View
        className={`flex-row items-center justify-between px-5 pb-2 border-b ${isDark ? "border-white/10" : "border-black/5"}`}
      >
        <Text
          className={`text-xl font-bold tracking-tight ${isDark ? "text-neutral-100" : "text-neutral-900"}`}
        >
          Emoji
        </Text>
      </View>

      <View
        className={`mx-4 mt-2 mb-1 flex-row items-center rounded-xl px-3 ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}
      >
        <Search size={18} color={isDark ? "#71717a" : "#a1a1aa"} />
        <BottomSheetTextInput
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 8,
            fontSize: 15,
            color: isDark ? "#ffffff" : "#171717",
          }}
          placeholder="Search emoji"
          placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <BottomSheetFlatList
        ref={flatListRef}
        data={filteredData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 80,
        }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={20}
        windowSize={7}
      />

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
    </BottomSheet>
  );
};
