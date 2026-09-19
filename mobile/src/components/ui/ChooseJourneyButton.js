import { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, Easing } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../theme/ThemeContext";
import CompassIcon from "./CompassIcon";

const SIZE = 200;

function PulseRing({ delay, colors }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 2200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1.25] });
  const opacity = anim.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.5, 0] });

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        borderWidth: 2,
        borderColor: colors.accent,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

export default function ChooseJourneyButton({ onPress, label = "Choose Your Journey" }) {
  const { colors } = useTheme();
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const innerScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
      <PulseRing delay={0} colors={colors} />
      <PulseRing delay={1100} colors={colors} />

      <Animated.View style={{ transform: [{ scale: innerScale }] }}>
        <Pressable
          onPress={handlePress}
          style={{
            width: SIZE - 36,
            height: SIZE - 36,
            borderRadius: (SIZE - 36) / 2,
            backgroundColor: colors.accentSoft,
            borderWidth: 1,
            borderColor: colors.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CompassIcon size={36} color={colors.accent} />
          <Text style={{ color: colors.accent, fontSize: 15, fontWeight: "700", marginTop: 10, textAlign: "center", paddingHorizontal: 12 }}>
            {label}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
