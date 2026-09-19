import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Modal, Animated, Dimensions, Easing } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useTheme } from "../../theme/ThemeContext";
import { useContentBlock } from "../../lib/useAppContent";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PANEL_WIDTH = Math.min(340, Math.round(SCREEN_WIDTH * 0.8));

function MenuRow({ icon, label, color, onPress, isLast, hideChevron }) {
  const { colors } = useTheme();
  const tint = color || colors.textPrimary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
        backgroundColor: pressed ? colors.surfaceAlt : "transparent",
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: color ? `${color}22` : colors.surfaceAlt,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Ionicons name={icon} size={19} color={tint} />
      </View>
      <Text style={{ flex: 1, color: tint, fontSize: 15.5, fontWeight: "600" }}>{label}</Text>
      {!hideChevron && <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
    </Pressable>
  );
}

export default function HeaderMenu({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  // Labels for the two navigation shortcuts are admin-editable via App Content.
  const allQuotesLabel = useContentBlock("menu_all_quotes")?.title || "All Quotes";
  const noContactLabel = useContentBlock("menu_no_contact")?.title || "No Contact";

  const items = [
    { key: "profile", label: "Profile", icon: "person-outline" },
    { key: "allQuotes", label: allQuotesLabel, icon: "sparkles-outline" },
    { key: "noContact", label: noContactLabel, icon: "map-outline" },
    { key: "privacy", label: "Privacy Policy", icon: "shield-checkmark-outline" },
    { key: "terms", label: "Terms & Conditions", icon: "document-text-outline" },
  ];

  const openMenu = () => setMounted(true);

  const closeMenu = () => {
    Animated.timing(progress, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setMounted(false));
  };

  useEffect(() => {
    if (mounted) {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [mounted]);

  const handlePress = (key) => {
    closeMenu();
    setTimeout(() => {
      if (key === "profile") navigation.navigate("Profile");
      if (key === "allQuotes") navigation.navigate("Quotes");
      if (key === "noContact") navigation.navigate("Journey");
      if (key === "privacy") navigation.navigate("PrivacyPolicy");
      if (key === "terms") navigation.navigate("Terms");
    }, 200);
  };

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-PANEL_WIDTH, 0] });
  const backdropOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const initial = (user?.firstName || user?.primaryEmailAddress?.emailAddress || "?")[0].toUpperCase();

  return (
    <>
      <Pressable
        onPress={openMenu}
        hitSlop={10}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="menu-outline" size={22} color={colors.textPrimary} />
      </Pressable>

      <Modal visible={mounted} transparent animationType="none" onRequestClose={closeMenu} statusBarTranslucent>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <Animated.View
            style={{
              width: PANEL_WIDTH,
              height: "100%",
              backgroundColor: colors.background,
              transform: [{ translateX }],
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 12,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 16,
              shadowOffset: { width: 6, height: 0 },
              elevation: 12,
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 20 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.accentSoft,
                  borderWidth: 1,
                  borderColor: colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Text style={{ color: colors.accent, fontSize: 18, fontWeight: "700" }}>{initial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "700" }} numberOfLines={1}>
                  {user?.fullName || "Your account"}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 1 }} numberOfLines={1}>
                  {user?.primaryEmailAddress?.emailAddress}
                </Text>
              </View>
              <Pressable
                onPress={closeMenu}
                hitSlop={8}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: colors.surfaceAlt,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Grouped nav card */}
            <View
              style={{
                marginHorizontal: 16,
                backgroundColor: colors.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: "hidden",
              }}
            >
              {items.map((item, i) => (
                <MenuRow
                  key={item.key}
                  icon={item.icon}
                  label={item.label}
                  onPress={() => handlePress(item.key)}
                  isLast={i === items.length - 1}
                />
              ))}
            </View>

            <View style={{ flex: 1 }} />

            {/* Log out card */}
            <View
              style={{
                marginHorizontal: 16,
                backgroundColor: colors.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: "hidden",
              }}
            >
              <MenuRow
                icon="log-out-outline"
                label="Log out"
                color={colors.danger}
                isLast
                hideChevron
                onPress={() => {
                  closeMenu();
                  setTimeout(() => signOut(), 200);
                }}
              />
            </View>
          </Animated.View>

          <Pressable style={{ flex: 1 }} onPress={closeMenu}>
            <Animated.View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                opacity: backdropOpacity,
              }}
            />
          </Pressable>
        </View>
      </Modal>
    </>
  );
}
