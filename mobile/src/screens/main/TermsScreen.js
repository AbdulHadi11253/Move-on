import { Text, ScrollView } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import Screen from "../../components/ui/Screen";
import AdminHeader from "../../components/admin/AdminHeader";

const SECTION_TITLE = { fontSize: 15, fontWeight: "700", marginTop: 20, marginBottom: 6 };
const BODY = { fontSize: 14, lineHeight: 21 };

export default function TermsScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <Screen>
      <AdminHeader title="Terms & Conditions" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8 }}>Last updated: September 30, 2026</Text>

        <Text style={[BODY, { color: colors.textSecondary }]}>
          By using Move On, you agree to these Terms & Conditions. If you do not agree, please do not use the
          app.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Not Medical or Therapeutic Advice</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          Move On is a self-improvement tool and is not a substitute for professional therapy, counseling, or
          medical care. If you are in crisis, please contact a licensed professional or local emergency
          services.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Subscriptions</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          Move On offers weekly and monthly auto-renewing subscriptions, each starting with a 3-day free trial.
          Your payment method is charged automatically when the trial ends unless you cancel at least 24 hours
          before it does. Subscriptions renew automatically unless canceled before the renewal date, through
          your App Store or Google Play account settings. Prices are shown in the app before purchase and may
          vary by region.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Free Tier and Advertising</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          You may continue using Move On without a subscription on a free, ad-supported tier with limited
          features. Subscribers do not see ads.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Account Deletion</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          You may delete your account and all associated data at any time from Profile → Delete Account. This
          action is permanent and cannot be undone.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>User Content</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          Comments and content you submit must not be abusive, harmful, or violate others' rights. We may
          remove content that violates these terms.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Limitation of Liability</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          Move On is provided "as is" without warranties of any kind. We are not liable for outcomes related
          to your use of the app.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Changes to These Terms</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          We may update these terms from time to time. Continued use of the app after changes means you accept
          the updated terms.
        </Text>

        <Text style={[SECTION_TITLE, { color: colors.textPrimary }]}>Contact</Text>
        <Text style={[BODY, { color: colors.textSecondary }]}>
          Questions about these terms can be sent to ptechagency@gmail.com.
        </Text>
      </ScrollView>
    </Screen>
  );
}
