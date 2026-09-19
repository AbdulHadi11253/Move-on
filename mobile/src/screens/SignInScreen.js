import { useCallback, useState } from "react";
import { View, Text, TextInput, Pressable, Alert, Platform } from "react-native";
import { useSignIn, useSignUp, useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import Screen from "../components/ui/Screen";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { colors } = useTheme();
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("sign_in");
  const [loading, setLoading] = useState(false);
  // Clerk's instance requires email verification at sign-up (email_code). Once
  // signUp.create() succeeds, we prepare verification and show a code field
  // instead of trying to activate a session before the address is verified.
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const onGooglePress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startGoogleFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      Alert.alert("Google sign-in failed", err.message || "Please try again.");
    }
  }, [startGoogleFlow]);

  const onApplePress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startAppleFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      Alert.alert("Apple sign-in failed", err.message || "Please try again.");
    }
  }, [startAppleFlow]);

  const onEmailSubmit = useCallback(async () => {
    if (!signInLoaded || !signUpLoaded) return;
    setLoading(true);
    try {
      if (mode === "sign_in") {
        const result = await signIn.create({ identifier: email, password });
        await setActiveSignIn({ session: result.createdSessionId });
      } else {
        await signUp.create({ emailAddress: email, password });
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setPendingVerification(true);
      }
    } catch (err) {
      Alert.alert("Sign-in error", err.errors?.[0]?.message || err.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [mode, email, password, signIn, signUp, signInLoaded, signUpLoaded]);

  const onVerifySubmit = useCallback(async () => {
    if (!signUpLoaded) return;
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActiveSignUp({ session: result.createdSessionId });
      } else {
        Alert.alert("Verification incomplete", "Please check the code and try again.");
      }
    } catch (err) {
      Alert.alert("Verification failed", err.errors?.[0]?.message || err.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [code, signUp, signUpLoaded, setActiveSignUp]);

  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: 12,
  };

  if (pendingVerification) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 28 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
            Check your email
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: "center", marginBottom: 28 }}>
            Enter the verification code we sent to {email}
          </Text>
          <TextInput
            placeholder="Verification code"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
            style={[inputStyle, { textAlign: "center", letterSpacing: 4, marginBottom: 20 }]}
          />
          <Pressable
            onPress={onVerifySubmit}
            disabled={loading}
            style={{
              backgroundColor: colors.accent,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Text style={{ color: colors.accentText, fontSize: 15, fontWeight: "600" }}>
              {loading ? "Verifying..." : "Verify"}
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 28 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            backgroundColor: colors.accentSoft,
            alignSelf: "center",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Ionicons name="sparkles" size={28} color={colors.accent} />
        </View>
        <Text style={{ color: colors.textPrimary, fontSize: 30, fontWeight: "700", textAlign: "center", marginBottom: 6 }}>
          Move On
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: "center", marginBottom: 36 }}>
          A calm space to start again.
        </Text>

        {Platform.OS === "ios" && (
          <Pressable
            onPress={onApplePress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#000000",
              borderRadius: 16,
              paddingVertical: 16,
              marginBottom: 12,
            }}
          >
            <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
            <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "600" }}>Continue with Apple</Text>
          </Pressable>
        )}

        <Pressable
          onPress={onGooglePress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            borderRadius: 16,
            paddingVertical: 16,
            marginBottom: 20,
          }}
        >
          <Ionicons name="logo-google" size={18} color={colors.textPrimary} style={{ marginRight: 10 }} />
          <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "600" }}>Continue with Google</Text>
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text style={{ marginHorizontal: 12, color: colors.textMuted, fontSize: 13 }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={inputStyle}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={[inputStyle, { marginBottom: 20 }]}
        />

        <Pressable
          onPress={onEmailSubmit}
          disabled={loading}
          style={{
            backgroundColor: colors.accent,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            marginBottom: 16,
            opacity: loading ? 0.7 : 1,
          }}
        >
          <Text style={{ color: colors.accentText, fontSize: 15, fontWeight: "600" }}>
            {loading ? "Please wait..." : mode === "sign_in" ? "Sign In" : "Create Account"}
          </Text>
        </Pressable>

        <Pressable onPress={() => setMode(mode === "sign_in" ? "sign_up" : "sign_in")}>
          <Text style={{ textAlign: "center", color: colors.textSecondary, fontSize: 14 }}>
            {mode === "sign_in" ? "New here? Create an account" : "Already have an account? Sign in"}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
