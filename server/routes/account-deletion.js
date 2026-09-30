// Public, unauthenticated page describing how to delete a Move On account —
// required by Google Play / App Store policy to be reachable without the app
// installed, even though deletion itself also happens in-app (Profile →
// Delete Account), which calls DELETE /api/users/me.
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Move On — Delete Your Account</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px 20px 80px; color: #1a1a1a; line-height: 1.6; }
  h1 { font-size: 24px; } h2 { font-size: 17px; margin-top: 24px; }
  p, li { font-size: 15px; color: #333; }
  code { background: #f2f2f2; padding: 2px 6px; border-radius: 4px; }
</style>
</head>
<body>
<h1>Delete Your Move On Account</h1>

<h2>In the app</h2>
<p>Open Move On, sign in, then go to <code>Profile → Delete Account</code> and confirm. This permanently and immediately deletes your account and all associated data — journeys, progress, saved posts, comments, and settings. This cannot be undone.</p>

<h2>Without the app</h2>
<p>If you no longer have the app installed, email <a href="mailto:ptechagency@gmail.com">ptechagency@gmail.com</a> from the email address on your account and ask us to delete it. We'll confirm once it's done, typically within a few business days.</p>

<h2>What gets deleted</h2>
<p>Your profile, onboarding answers, journey enrollments and progress, task completions, saved and favorited quotes, comments, notification settings, and subscription record. Some records may be retained where required by law (for example, a completed purchase record).</p>

<p>See our <a href="/api/privacy">Privacy Policy</a> for more.</p>
</body>
</html>`;

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(HTML);
};
