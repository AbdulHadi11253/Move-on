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
        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8 }}>Last updated: September 30, 2026</Text>

        <Text style={[BODY, { color: colors.textSecondary }]}>
          This Privacy Policy explains how Move On ("we", "us") collects, uses, and protects your information
          when you use the app.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Information We Collect</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          Account information such as your name, email address, age, and gender; your onboarding responses;
          journey and progress data (current day, streak, completed tasks); content you save, comment on, or
          submit; your notification and appearance preferences; and subscription status. If you sign in with
          Apple or Google, we receive the name and email your account provides. We do not access your photos or
          media except when you deliberately choose one to upload (admin accounts only).
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>How We Use Your Information</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          To create and secure your account, provide and personalize your recovery journey, sync your progress
          across sessions and devices, send the notifications you've opted into, process subscription purchases,
          and maintain and improve the app.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Data Sharing</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          We do not sell your personal information. We share data only with service providers who help us
          operate the app, each acting under their own privacy terms:
        </Text>
        <Text style={[BODY, { color: colors.textSecondary, marginTop: 6 }]}>
          • Clerk — authentication and account sign-in{"\n"}
          • Neon (PostgreSQL) — our application database{"\n"}
          • Supabase — storage for images you or admins upload{"\n"}
          • RevenueCat, Apple, and Google — subscription purchases and billing{"\n"}
          • Google AdMob — advertising for users on the free, ad-supported tier (subscribers see no ads).
          AdMob may use device identifiers to personalize ads; you can opt out of ad tracking in your device
          settings and are asked for permission the first time ads are shown{"\n"}
          • Apple/Google push notification services — delivering the reminders you enable
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Data Retention</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          We retain your account data for as long as your account is active. If you delete your account, your
          profile, journey progress, saved content, and comments are permanently deleted from our database. Some
          information may be retained where required by law (for example, records of a completed purchase).
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Your Choices</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          You can edit your profile, manage notification and appearance preferences, and permanently delete your
          account and all associated data at any time from Profile → Delete Account, or by contacting us below.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Children's Privacy</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          Move On is not directed to children under 13, and we do not knowingly collect information from
          children under 13.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Changes to This Policy</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          We may update this policy from time to time. Continued use of the app after a change means you accept
          the updated policy.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Contact</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          Questions about this policy, or requests to access or delete your data, can be sent to{" "}
          ptechagency@gmail.com.
        </Text>
      </ScrollView>
    </Screen>
  );
}
