import { useEffect, useRef, useState } from "react";
import { Animated, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";

export default function NetworkBanner() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isOffline, setIsOffline] = useState(false);
  const height = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false || state.isInternetReachable === false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.timing(height, {
      toValue: isOffline ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isOffline]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        backgroundColor: colors.danger,
        paddingTop: insets.top,
        paddingBottom: height.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }),
        opacity: height,
        transform: [
          {
            translateY: height.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }),
          },
        ],
      }}
    >
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          height: height.interpolate({ inputRange: [0, 1], outputRange: [0, 34] }),
        }}
      >
        <Ionicons name="cloud-offline-outline" size={14} color="#FFFFFF" />
        <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600", marginLeft: 6 }}>
          Your network is down
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
