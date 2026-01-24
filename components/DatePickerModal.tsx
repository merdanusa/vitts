import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DatePickerModalProps {
  visible: boolean;
  isDark: boolean;
  initialDate: string;
  onClose: () => void;
  onConfirm: (date: string) => void;
}

export function DatePickerModal({
  visible,
  isDark,
  initialDate,
  onClose,
  onConfirm,
}: DatePickerModalProps) {
  const parseDate = (dateStr: string) => {
    if (!dateStr) {
      const now = new Date();
      return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
      };
    }
    const parts = dateStr.split("-");
    return {
      year: parseInt(parts[0]) || new Date().getFullYear(),
      month: parseInt(parts[1]) || new Date().getMonth() + 1,
      day: parseInt(parts[2]) || new Date().getDate(),
    };
  };

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  useEffect(() => {
    const parsed = parseDate(initialDate);
    setSelectedYear(parsed.year);
    setSelectedMonth(parsed.month);
    setSelectedDay(parsed.day);
  }, [initialDate]);

  const handleConfirm = () => {
    const formattedDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    onConfirm(formattedDate);
  };

  const years = Array.from(
    { length: 100 },
    (_, i) => new Date().getFullYear() - i,
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  const days = Array.from(
    { length: getDaysInMonth(selectedYear, selectedMonth) },
    (_, i) => i + 1,
  );

  const renderPicker = (
    items: number[],
    selectedValue: number,
    onSelect: (value: number) => void,
    width: string,
  ) => {
    return (
      <View style={{ width, height: 180, overflow: "hidden" }}>
        <View
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 36,
            marginTop: -18,
            backgroundColor: isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.03)",
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          }}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          snapToInterval={36}
          decelerationRate="fast"
          contentContainerStyle={{ paddingVertical: 72 }}
        >
          {items.map((item) => {
            const isSelected = item === selectedValue;
            const distance = Math.abs(
              items.indexOf(item) - items.indexOf(selectedValue),
            );
            const opacity = Math.max(0.3, 1 - distance * 0.2);
            const scale = isSelected ? 1 : Math.max(0.85, 1 - distance * 0.05);

            return (
              <TouchableOpacity
                key={item}
                onPress={() => onSelect(item)}
                style={{
                  height: 36,
                  justifyContent: "center",
                  alignItems: "center",
                  transform: [{ scale }],
                }}
              >
                <Text
                  style={{
                    color: isDark ? "#ffffff" : "#000000",
                    fontSize: isSelected ? 20 : 17,
                    fontWeight: isSelected ? "600" : "400",
                    opacity,
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View
          style={{
            backgroundColor: isDark ? "#1c1c1e" : "#f2f2f7",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 40,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? "#38383a" : "#d1d1d6",
            }}
          >
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Text style={{ color: "#007aff", fontSize: 17 }}>Cancel</Text>
            </TouchableOpacity>
            <Text
              style={{
                color: isDark ? "#ffffff" : "#000000",
                fontSize: 17,
                fontWeight: "600",
              }}
            >
              Select Birthday
            </Text>
            <TouchableOpacity onPress={handleConfirm} style={{ padding: 4 }}>
              <Text
                style={{ color: "#007aff", fontSize: 17, fontWeight: "600" }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              paddingVertical: 20,
              paddingHorizontal: 16,
              gap: 8,
            }}
          >
            {renderPicker(months, selectedMonth, setSelectedMonth, "30%")}
            {renderPicker(days, selectedDay, setSelectedDay, "30%")}
            {renderPicker(years, selectedYear, setSelectedYear, "40%")}
          </View>
        </View>
      </View>
    </Modal>
  );
}
