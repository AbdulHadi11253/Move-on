import { Text, ScrollView } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import Screen from "../../components/ui/Screen";
import AdminHeader from "../../components/admin/AdminHeader";

const SECTION_TITLE = { fontSize: 15, fontWeight: "700", marginTop: 20, marginBottom: 6 };
const BODY = { fontSize: 14, lineHeight: 21 };

export default function PrivacyPolicyScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <Screen>
      <AdminHeader title="Privacy Policy" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8 }}>Last updated: Insert date</Text>

        <Text style={[BODY, { color: colors.textSecondary }]}>
          This Privacy Policy explains how Move On ("we", "us") collects, uses, and protects your information
          when you use the app.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Information We Collect</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          Account information (such as your name and email address), onboarding responses, journey progress,
          content you save or comment on, and basic device/usage information needed to operate the app.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>How We Use Your Information</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          To provide and personalize your recovery journey, sync your progress across sessions, send the
          notifications you've opted into, and improve the app.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Data Sharing</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          We do not sell your personal information. We use trusted third-party services (such as our
          authentication, database, and storage providers) solely to operate the app.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Your Choices</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          You can edit your profile, manage notification preferences, or delete your account at any time by
          contacting us.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Contact</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          Questions about this policy can be sent to Insert support email.
        </Text>

        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 24, fontStyle: "italic" }}>
          This is placeholder text. Please have a legal professional review and finalize this policy before
          publishing the app to the App Store or Google Play.
        </Text>
      </ScrollView>
    </Screen>
  );
}
