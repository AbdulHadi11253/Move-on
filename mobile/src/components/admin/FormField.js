import { View, Text, TextInput } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

export default function FormField({ label, value, onChangeText, placeholder, multiline, keyboardType }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.6,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? "top" : "center"}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 15,
          color: colors.textPrimary,
          height: multiline ? 96 : undefined,
        }}
      />
    </View>
  );
}
