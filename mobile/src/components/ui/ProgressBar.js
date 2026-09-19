import { View } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

export default function ProgressBar({ progress = 0, height = 8 }) {
  const { colors } = useTheme();
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View
      style={{
        height,
        borderRadius: height,
        backgroundColor: colors.surfaceAlt,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height,
          borderRadius: height,
          width: `${pct}%`,
          backgroundColor: colors.accent,
        }}
      />
    </View>
  );
}
