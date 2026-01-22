import { useColorScheme } from "nativewind";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface AuthInputProps extends TextInputProps {
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export const AuthInput = ({
  isPassword,
  showPassword,
  onTogglePassword,
  ...props
}: AuthInputProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const styles = {
    container: {
      marginBottom: 24,
      position: "relative" as "relative",
    },
    input: {
      backgroundColor: isDark ? "#111" : "#f8f9fa",
      color: isDark ? "#fff" : "#000",
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#ddd",
      height: 56,
      borderRadius: 16,
      paddingHorizontal: 20,
      fontSize: 16,
      paddingRight: isPassword ? 80 : 20, // Add padding if password toggle exists
    },
    toggle: {
      position: "absolute" as "absolute",
      right: 20,
      top: 16,
    },
    toggleText: {
      color: "#007AFF",
      fontWeight: "500" as "500",
      fontSize: 16,
    },
  };

  return (
    <View style={styles.container}>
      <TextInput
        {...props}
        style={[styles.input, props.style]}
        placeholderTextColor={isDark ? "#666" : "#999"}
        secureTextEntry={isPassword && !showPassword}
      />
      {isPassword && (
        <TouchableOpacity style={styles.toggle} onPress={onTogglePassword}>
          <Text style={styles.toggleText}>
            {showPassword ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
