import { Pressable, Text } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

export default function DeleteButton({ onPress, label = "Delete" }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 12,
        borderWidth: 1,
        borderColor: colors.danger,
      }}
    >
      <Text style={{ color: colors.danger, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}
