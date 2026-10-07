import { useState } from "react";
import { View, Text, Image, Pressable, FlatList, Modal, Dimensions, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Full-screen "tap to read" view for a single quote post (image or text) —
// opened from QuotePostCard's own tap handler so every feed/category/explore
// screen gets this for free, phone or tablet.
export default function QuoteReaderModal({ post, visible, onClose }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);

  if (!post) return null;
  const images = post.images || [];
  const isText = images.length === 0 && !!post.text;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          style={{
            position: "absolute",
            top: insets.top + 12,
            right: 20,
            zIndex: 10,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.15)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>

        {isText ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
            <Ionicons name="sparkles" size={24} color={colors.accent} style={{ marginBottom: 20 }} />
            <Text style={{ color: "#FFFFFF", fontSize: 26, lineHeight: 36, fontWeight: "600", textAlign: "center" }}>
              {post.text}
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <FlatList
              data={images}
              keyExtractor={(item, i) => item.id || String(i)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))}
              renderItem={({ item }) => (
                <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, alignItems: "center", justifyContent: "center" }}>
                  <Image source={{ uri: item.imageUrl }} style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }} resizeMode="contain" />
                </View>
              )}
            />
            {images.length > 1 && (
              <View style={{ position: "absolute", bottom: insets.bottom + 24, flexDirection: "row" }}>
                {images.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 3.5,
                      marginHorizontal: 3,
                      backgroundColor: i === index ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}
