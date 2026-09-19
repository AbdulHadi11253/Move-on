import { View, Text } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

export default function Chip({ label, sublabel, active }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 14,
        marginHorizontal: 4,
        backgroundColor: active ? colors.accentSoft : colors.surface,
        borderWidth: 1,
        borderColor: active ? colors.accent : colors.border,
      }}
    >
      <Text style={{ color: active ? colors.accent : colors.textPrimary, fontWeight: "700", fontSize: 15 }}>
        {label}
      </Text>
      {!!sublabel && (
        <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>{sublabel}</Text>
      )}
    </View>
  );
}
