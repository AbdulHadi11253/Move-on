import { View, Text } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

// status: "done" | "active" | "locked"
export default function StepBadge({ number, status }) {
  const { colors } = useTheme();
  const bg = status === "done" || status === "active" ? colors.accent : colors.surfaceAlt;
  const textColor = status === "done" || status === "active" ? colors.accentText : colors.textMuted;
  const borderColor = status === "active" ? colors.accent : "transparent";

  return (
    <View
      style={{
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: status === "active" ? 2 : 0,
        borderColor,
      }}
    >
      <Text style={{ color: textColor, fontWeight: "700", fontSize: 13 }}>
        {status === "done" ? "✓" : number}
      </Text>
    </View>
  );
}
