import {
  createWill,
  CreateWillPayload,
  createWillWithMedia,
  getWillById,
  updateWill,
} from "@/services/api";
import { RootState } from "@/store";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronDown, Image as ImageIcon, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const CATEGORIES = [
  "advice",
  "experience",
  "lesson",
  "opinion",
  "rule",
  "news",
  "update",
  "announcement",
  "promo",
  "tip",
];

const TONES = [
  "calm",
  "strong",
  "emotional",
  "direct",
  "motivational",
  "informative",
  "fun",
  "serious",
  "promotional",
];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "followers", label: "Followers" },
  { value: "private", label: "Private" },
];

export default function ManageWillScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEditing = !!id;
  const isDark = useSelector((state: RootState) => state.theme.isDark);

  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("advice");
  const [tone, setTone] = useState<string>("direct");
  const [visibility, setVisibility] = useState<string>("public");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<{
    uri: string;
    fileName: string;
    mimeType: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showTonePicker, setShowTonePicker] = useState(false);
  const [showVisibilityPicker, setShowVisibilityPicker] = useState(false);

  useEffect(() => {
    if (isEditing && typeof id === "string") {
      loadWill(id);
    }
  }, [id]);

  const loadWill = async (willId: string) => {
    try {
      setInitialLoading(true);
      const will = await getWillById(willId);
      setContent(will.content);
      setCategory(will.category);
      setTone(will.tone);
      setVisibility(will.visibility);
      setTags(will.tags);
      if (will.media && will.media.length > 0) {
        setSelectedImage(will.media[0].url);
      }
    } catch (error) {
      console.error("Failed to load will:", error);
      Alert.alert("Error", "Failed to load will");
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Please allow access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedImage(asset.uri);
      setImageFile({
        uri: asset.uri,
        fileName: asset.fileName || `image-${Date.now()}.jpg`,
        mimeType: asset.mimeType || "image/jpeg",
      });
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageFile(null);
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Content is required");
      return;
    }

    if (content.length > 280) {
      Alert.alert("Error", "Content must not exceed 280 characters");
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);

      if (isEditing && typeof id === "string") {
        const payload: CreateWillPayload = {
          content: content.trim(),
          category: category as any,
          tone: tone as any,
          visibility: visibility as any,
          tags,
        };

        await updateWill(id, payload);
        Alert.alert("Success", "Will updated successfully");
      } else {
        if (imageFile) {
          await createWillWithMedia(
            content.trim(),
            imageFile.uri,
            imageFile.fileName,
            imageFile.mimeType,
            {
              category: category as any,
              tone: tone as any,
              visibility: visibility as any,
              tags,
            },
            (progressEvent) => {
              const progress = progressEvent.total
                ? (progressEvent.loaded / progressEvent.total) * 100
                : 0;
              setUploadProgress(progress);
            },
          );
        } else {
          const payload: CreateWillPayload = {
            content: content.trim(),
            category: category as any,
            tone: tone as any,
            visibility: visibility as any,
            tags,
          };

          await createWill(payload);
        }

        Alert.alert("Success", "Will created successfully");
      }

      router.back();
    } catch (error: any) {
      console.error("Failed to save will:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save will",
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView
        style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
      className="flex-1"
    >
      <View
        style={{
          borderBottomWidth: 0.5,
          borderBottomColor: isDark ? "#2c2c2e" : "#e5e7eb",
        }}
        className="flex-row justify-between items-center px-4 py-3"
      >
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={{ color: "#007AFF" }} className="text-base">
            Cancel
          </Text>
        </TouchableOpacity>

        <Text
          style={{ color: isDark ? "#ffffff" : "#000000" }}
          className="text-lg font-semibold"
        >
          {isEditing ? "Edit Will" : "New Will"}
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading || !content.trim()}
          activeOpacity={0.7}
        >
          <Text
            style={{
              color:
                loading || !content.trim()
                  ? isDark
                    ? "#2c2c2e"
                    : "#d1d5db"
                  : "#007AFF",
            }}
            className="text-base font-semibold"
          >
            {loading ? "Posting..." : "Post"}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="p-4 space-y-4">
            <View>
              <Text
                style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                className="text-sm font-medium mb-2"
              >
                Content
              </Text>
              <View
                style={{
                  borderWidth: 0.5,
                  borderColor: isDark ? "#2c2c2e" : "#d1d5db",
                  backgroundColor: isDark ? "#1c1c1e" : "#ffffff",
                }}
                className="rounded-xl overflow-hidden"
              >
                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder="Share your wisdom..."
                  placeholderTextColor={isDark ? "#8e8e93" : "#9ca3af"}
                  style={{
                    color: isDark ? "#ffffff" : "#000000",
                    minHeight: 120,
                  }}
                  className="p-3 text-base"
                  maxLength={280}
                  multiline
                  textAlignVertical="top"
                />
              </View>
              <Text
                style={{ color: isDark ? "#8e8e93" : "#9ca3af" }}
                className="text-xs text-right mt-1"
              >
                {content.length}/280
              </Text>
            </View>

            {selectedImage && (
              <View className="relative">
                <Image
                  source={{ uri: selectedImage }}
                  style={{ width: "100%", height: 200 }}
                  className="rounded-2xl"
                />
                <TouchableOpacity
                  onPress={removeImage}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 32,
                    height: 32,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: 16,
                  }}
                  className="items-center justify-center"
                  activeOpacity={0.7}
                >
                  <X size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}

            {!selectedImage && !isEditing && (
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  borderWidth: 2,
                  borderStyle: "dashed",
                  borderColor: isDark ? "#2c2c2e" : "#d1d5db",
                }}
                className="rounded-2xl p-8 items-center"
                activeOpacity={0.7}
              >
                <ImageIcon size={32} color={isDark ? "#8e8e93" : "#9ca3af"} />
                <Text
                  style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                  className="mt-2"
                >
                  Add Image
                </Text>
              </TouchableOpacity>
            )}

            {loading && uploadProgress > 0 && (
              <View
                style={{
                  backgroundColor: isDark ? "#1c1c1e" : "#eff6ff",
                }}
                className="rounded-xl p-3"
              >
                <Text style={{ color: "#007AFF" }} className="text-sm mb-2">
                  Uploading... {Math.round(uploadProgress)}%
                </Text>
                <View
                  style={{
                    backgroundColor: isDark ? "#2c2c2e" : "#dbeafe",
                  }}
                  className="h-2 rounded-full overflow-hidden"
                >
                  <View
                    style={{
                      width: `${uploadProgress}%`,
                      backgroundColor: "#007AFF",
                    }}
                    className="h-full"
                  />
                </View>
              </View>
            )}

            <View>
              <Text
                style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                className="text-sm font-medium mb-2"
              >
                Category
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                style={{
                  borderWidth: 0.5,
                  borderColor: isDark ? "#2c2c2e" : "#d1d5db",
                  backgroundColor: isDark ? "#1c1c1e" : "#ffffff",
                }}
                className="rounded-xl p-3 flex-row justify-between items-center"
                activeOpacity={0.7}
              >
                <Text
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="text-base capitalize"
                >
                  {category}
                </Text>
                <ChevronDown size={20} color={isDark ? "#8e8e93" : "#9ca3af"} />
              </TouchableOpacity>

              {showCategoryPicker && (
                <View
                  style={{
                    borderWidth: 0.5,
                    borderColor: isDark ? "#2c2c2e" : "#d1d5db",
                    backgroundColor: isDark ? "#1c1c1e" : "#ffffff",
                  }}
                  className="rounded-xl overflow-hidden mt-2"
                >
                  {CATEGORIES.map((cat, index) => (
                    <View key={cat}>
                      <TouchableOpacity
                        onPress={() => {
                          setCategory(cat);
                          setShowCategoryPicker(false);
                        }}
                        style={{
                          backgroundColor:
                            category === cat
                              ? isDark
                                ? "#2c2c2e"
                                : "#f3f4f6"
                              : "transparent",
                        }}
                        className="p-3"
                        activeOpacity={0.7}
                      >
                        <Text
                          style={{
                            color:
                              category === cat
                                ? "#007AFF"
                                : isDark
                                  ? "#ffffff"
                                  : "#000000",
                          }}
                          className="text-base capitalize"
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                      {index < CATEGORIES.length - 1 && (
                        <View
                          style={{
                            height: 0.5,
                            backgroundColor: isDark ? "#2c2c2e" : "#e5e7eb",
                          }}
                        />
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View>
              <Text
                style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                className="text-sm font-medium mb-2"
              >
                Tone
              </Text>
              <TouchableOpacity
                onPress={() => setShowTonePicker(!showTonePicker)}
                style={{
                  borderWidth: 0.5,
                  borderColor: isDark ? "#2c2c2e" : "#d1d5db",
                  backgroundColor: isDark ? "#1c1c1e" : "#ffffff",
                }}
                className="rounded-xl p-3 flex-row justify-between items-center"
                activeOpacity={0.7}
              >
                <Text
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="text-base capitalize"
                >
                  {tone}
                </Text>
                <ChevronDown size={20} color={isDark ? "#8e8e93" : "#9ca3af"} />
              </TouchableOpacity>

              {showTonePicker && (
                <View
                  style={{
                    borderWidth: 0.5,
                    borderColor: isDark ? "#2c2c2e" : "#d1d5db",
                    backgroundColor: isDark ? "#1c1c1e" : "#ffffff",
                  }}
                  className="rounded-xl overflow-hidden mt-2"
                >
                  {TONES.map((t, index) => (
                    <View key={t}>
                      <TouchableOpacity
                        onPress={() => {
                          setTone(t);
                          setShowTonePicker(false);
                        }}
                        style={{
                          backgroundColor:
                            tone === t
                              ? isDark
                                ? "#2c2c2e"
                                : "#f3f4f6"
                              : "transparent",
                        }}
                        className="p-3"
                        activeOpacity={0.7}
                      >
                        <Text
                          style={{
                            color:
                              tone === t
                                ? "#007AFF"
                                : isDark
                                  ? "#ffffff"
                                  : "#000000",
                          }}
                          className="text-base capitalize"
                        >
                          {t}
                        </Text>
                      </TouchableOpacity>
                      {index < TONES.length - 1 && (
                        <View
                          style={{
                            height: 0.5,
                            backgroundColor: isDark ? "#2c2c2e" : "#e5e7eb",
                          }}
                        />
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View>
              <Text
                style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                className="text-sm font-medium mb-2"
              >
                Visibility
              </Text>
              <TouchableOpacity
                onPress={() => setShowVisibilityPicker(!showVisibilityPicker)}
                style={{
                  borderWidth: 0.5,
                  borderColor: isDark ? "#2c2c2e" : "#d1d5db",
                  backgroundColor: isDark ? "#1c1c1e" : "#ffffff",
                }}
                className="rounded-xl p-3 flex-row justify-between items-center"
                activeOpacity={0.7}
              >
                <Text
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                  className="text-base capitalize"
                >
                  {visibility}
                </Text>
                <ChevronDown size={20} color={isDark ? "#8e8e93" : "#9ca3af"} />
              </TouchableOpacity>

              {showVisibilityPicker && (
                <View
                  style={{
                    borderWidth: 0.5,
                    borderColor: isDark ? "#2c2c2e" : "#d1d5db",
                    backgroundColor: isDark ? "#1c1c1e" : "#ffffff",
                  }}
                  className="rounded-xl overflow-hidden mt-2"
                >
                  {VISIBILITY_OPTIONS.map((option, index) => (
                    <View key={option.value}>
                      <TouchableOpacity
                        onPress={() => {
                          setVisibility(option.value);
                          setShowVisibilityPicker(false);
                        }}
                        style={{
                          backgroundColor:
                            visibility === option.value
                              ? isDark
                                ? "#2c2c2e"
                                : "#f3f4f6"
                              : "transparent",
                        }}
                        className="p-3"
                        activeOpacity={0.7}
                      >
                        <Text
                          style={{
                            color:
                              visibility === option.value
                                ? "#007AFF"
                                : isDark
                                  ? "#ffffff"
                                  : "#000000",
                          }}
                          className="text-base"
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                      {index < VISIBILITY_OPTIONS.length - 1 && (
                        <View
                          style={{
                            height: 0.5,
                            backgroundColor: isDark ? "#2c2c2e" : "#e5e7eb",
                          }}
                        />
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View>
              <Text
                style={{ color: isDark ? "#8e8e93" : "#6b7280" }}
                className="text-sm font-medium mb-2"
              >
                Tags
              </Text>
              <View className="flex-row space-x-2">
                <View className="flex-1">
                  <TextInput
                    value={tagInput}
                    onChangeText={setTagInput}
                    placeholder="Add a tag"
                    placeholderTextColor={isDark ? "#8e8e93" : "#9ca3af"}
                    style={{
                      borderWidth: 0.5,
                      borderColor: isDark ? "#2c2c2e" : "#d1d5db",
                      backgroundColor: isDark ? "#1c1c1e" : "#ffffff",
                      color: isDark ? "#ffffff" : "#000000",
                    }}
                    className="rounded-xl p-3 text-base"
                    onSubmitEditing={addTag}
                    returnKeyType="done"
                  />
                </View>
                <TouchableOpacity
                  onPress={addTag}
                  style={{
                    backgroundColor: "#007AFF",
                  }}
                  className="rounded-xl px-4 items-center justify-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-medium">Add</Text>
                </TouchableOpacity>
              </View>

              {tags.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: isDark ? "#1c1c1e" : "#eff6ff",
                      }}
                      className="rounded-full px-3 py-1 flex-row items-center space-x-1"
                    >
                      <Text style={{ color: "#007AFF" }}>#{tag}</Text>
                      <TouchableOpacity
                        onPress={() => removeTag(tag)}
                        activeOpacity={0.7}
                      >
                        <X size={16} color="#007AFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
