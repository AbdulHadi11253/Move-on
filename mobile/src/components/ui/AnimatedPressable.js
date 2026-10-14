import { Pressable } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

// A drop-in replacement for Pressable that adds a subtle, native-thread
// press-scale animation — the single most common "this feels premium"
// signal in a polished app, and the cheapest one to add safely: it only
// touches `transform`, runs entirely on the UI thread via Reanimated, and
// never changes layout, so it can't affect hit testing, sibling positions,
// or anything else already relying on a plain Pressable's behavior. All
// props are forwarded as-is (onPress, disabled, style function form, etc.)
// so swapping Pressable -> AnimatedPressable is behavior-preserving.
export default function AnimatedPressable({ scaleTo = 0.96, style, onPressIn, onPressOut, children, ...rest }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressableBase
      {...rest}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, { damping: 16, stiffness: 260 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 16, stiffness: 260 });
        onPressOut?.(e);
      }}
      style={[animatedStyle, typeof style === "function" ? style({ pressed: false }) : style]}
    >
      {children}
    </AnimatedPressableBase>
  );
}
