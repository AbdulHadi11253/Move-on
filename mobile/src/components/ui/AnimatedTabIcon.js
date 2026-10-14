import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

// A small focus-change "pop" for bottom tab icons — scales up briefly when
// a tab becomes active, settling back with a spring. Purely decorative
// (transform only), so it can't affect tab-bar layout, hit areas, or the
// existing focused/unfocused icon-name swap this already relied on.
export default function AnimatedTabIcon({ name, outlineName, focused, color, size = 24 }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, { damping: 10, stiffness: 200 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={focused ? name : outlineName} size={size} color={color} />
    </Animated.View>
  );
}
