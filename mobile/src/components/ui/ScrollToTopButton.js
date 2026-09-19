import { useEffect, useRef } from "react";
import { Animated, Pressable, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";

// Floating button that fades/scales in once `visible` is true. Position it inside
// a Screen (which is flex:1) so it anchors to the bottom-right of the content area.
export default function ScrollToTopButton({ visible, onPress, bottom = 24 }) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={{
        position: "absolute",
        right: 20,
        bottom,
        opacity: anim,
        transform: [
          { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
        ],
      }}
    >
      <Pressable
        onPress={onPress}
        style={{
          width: 46,
          height: 46,
          borderRadius: 23,
          backgroundColor: colors.accent,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Ionicons name="chevron-up" size={24} color={colors.accentText} />
      </Pressable>
    </Animated.View>
  );
}
