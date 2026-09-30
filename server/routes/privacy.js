// Public, unauthenticated Privacy Policy page — the URL App Store Connect
// and Google Play Console require, independent of the in-app copy.
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Move On — Privacy Policy</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px 20px 80px; color: #1a1a1a; line-height: 1.6; }
  h1 { font-size: 24px; } h2 { font-size: 17px; margin-top: 28px; }
  p, li { font-size: 15px; color: #333; }
  .updated { color: #777; font-size: 13px; }
</style>
</head>
<body>
<h1>Move On — Privacy Policy</h1>
<p class="updated">Last updated: September 30, 2026</p>
<p>This Privacy Policy explains how Move On ("we", "us") collects, uses, and protects your information when you use the app.</p>

<h2>Information We Collect</h2>
<p>Account information such as your name, email address, age, and gender; your onboarding responses; journey and progress data (current day, streak, completed tasks); content you save, comment on, or submit; your notification and appearance preferences; and subscription status. If you sign in with Apple or Google, we receive the name and email your account provides.</p>

<h2>How We Use Your Information</h2>
<p>To create and secure your account, provide and personalize your recovery journey, sync your progress across sessions and devices, send the notifications you've opted into, process subscription purchases, and maintain and improve the app.</p>

<h2>Data Sharing</h2>
<p>We do not sell your personal information. We share data only with service providers who help us operate the app:</p>
<ul>
  <li>Clerk — authentication and account sign-in</li>
  <li>Neon (PostgreSQL) — our application database</li>
  <li>Supabase — storage for uploaded images</li>
  <li>RevenueCat, Apple, and Google — subscription purchases and billing</li>
  <li>Google AdMob — advertising for users on the free, ad-supported tier</li>
  <li>Apple/Google push notification services — delivering reminders you enable</li>
</ul>

<h2>Data Retention</h2>
<p>We retain your account data for as long as your account is active. If you delete your account, your profile, journey progress, saved content, and comments are permanently deleted from our database.</p>

<h2>Your Choices</h2>
<p>You can edit your profile, manage notification and appearance preferences, and permanently delete your account and all associated data at any time from Profile → Delete Account in the app, or by contacting us below. See also our <a href="/api/account-deletion">Account Deletion</a> page.</p>

<h2>Children's Privacy</h2>
<p>Move On is not directed to children under 13, and we do not knowingly collect information from children under 13.</p>

<h2>Changes to This Policy</h2>
<p>We may update this policy from time to time. Continued use of the app after a change means you accept the updated policy.</p>

<h2>Contact</h2>
<p>Questions about this policy, or requests to access or delete your data, can be sent to <a href="mailto:ptechagency@gmail.com">ptechagency@gmail.com</a>.</p>
</body>
</html>`;

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(HTML);
};
