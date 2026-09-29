import { useRef, useState } from "react";
import { View, Text, Pressable, Animated, Easing } from "react-native";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../theme/ThemeContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 220;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DURATION = 2800;

// Long-press control matching StartRecoveryButton's design/interaction, used
// wherever the user needs to commit to picking a journey (Home/Progress empty
// states). A simple tap here made it too easy to land on the journey picker
// by accident.
export default function ChooseJourneyButton({ onPress, onSkip, label = "Choose Your Journey" }) {
  const { colors } = useTheme();
  const [percent, setPercent] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const completedRef = useRef(false);
  const lastHapticStep = useRef(0);
  const listenerIdRef = useRef(null);

  const holdIn = () => {
    completedRef.current = false;
    lastHapticStep.current = 0;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    listenerIdRef.current = progress.addListener(({ value }) => {
      const pct = Math.round(value * 100);
      setPercent(pct);
      const step = Math.floor(pct / 8);
      if (step > lastHapticStep.current) {
        lastHapticStep.current = step;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    });

    Animated.timing(progress, {
      toValue: 1,
      duration: DURATION,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (listenerIdRef.current !== null) {
        progress.removeListener(listenerIdRef.current);
        listenerIdRef.current = null;
      }
      if (finished) {
        completedRef.current = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onPress?.();
      }
    });
  };

  const holdOut = () => {
    if (completedRef.current) return;
    progress.stopAnimation();
    if (listenerIdRef.current !== null) {
      progress.removeListener(listenerIdRef.current);
      listenerIdRef.current = null;
    }
    progress.setValue(0);
    setPercent(0);
  };

  const strokeDashoffset = progress.interpolate({ inputRange: [0, 1], outputRange: [CIRCUMFERENCE, 0] });
  const stageLabel = percent >= 100 ? "Let's go" : percent >= 25 ? "Keep holding..." : label;

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
        <Svg width={SIZE} height={SIZE} style={{ position: "absolute" }}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke={colors.surfaceAlt} strokeWidth={STROKE} fill="none" />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.accent}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE}, ${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>

        <Pressable
          onPressIn={holdIn}
          onPressOut={holdOut}
          style={{
            width: SIZE - STROKE * 3,
            height: SIZE - STROKE * 3,
            borderRadius: (SIZE - STROKE * 3) / 2,
            backgroundColor: colors.accentSoft,
            borderWidth: 1,
            borderColor: colors.accent,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 16,
          }}
        >
          <Text style={{ color: colors.accent, fontSize: 15, fontWeight: "700", textAlign: "center" }}>{stageLabel}</Text>
        </Pressable>
      </View>

      <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 20, textAlign: "center" }}>
        Press and hold to choose your journey
      </Text>

      {onSkip && (
        <Pressable onPress={onSkip} hitSlop={10} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: "600" }}>Start later</Text>
        </Pressable>
      )}
    </View>
  );
}
