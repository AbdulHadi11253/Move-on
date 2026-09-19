# Move On — Complete Product Plan
### Premium Healing & Personal Transformation App (iOS + Android)

**Prepared for:** Founder / Instagram creator with a multi-million-reach audience of women 18–44 navigating breakups, toxic relationships, emotional healing, and self-growth.

**Positioning statement:** *Move On is the daily companion that turns heartbreak into the start of your best chapter — a personalized healing system combining structured programs, journaling, mood/habit tracking, AI guidance, and gamified progress, built for women who are done waiting to feel like themselves again.*

---

## Table of Contents

1. Product Vision & Differentiation
2. Target User & Personas
3. Information Architecture — Full Screen List
4. Onboarding Flow (20+ Questions)
5. Personalization Engine ("Healing Plan" Logic)
6. Complete Feature Set
7. Gamification System
8. AI Features
9. Notifications Strategy
10. Subscriptions & Monetization
11. Premium Feature Breakdown & Long-Term Retention Hooks
12. Authentication
13. Admin Panel — Full Spec
14. Database Structure
15. Platform Capabilities (Offline, Widgets, Themes, i18n, etc.)
16. Future Roadmap
17. Success Metrics / KPIs

---

## 1. Product Vision & Differentiation

**Vision:** Become the #1 healing and self-transformation app for women recovering from breakups and toxic relationships — the "Calm/Headspace of heartbreak recovery," but built specifically around romantic healing, self-worth rebuilding, and emotional independence.

**Why it can win:**
- Existing meditation/habit apps (Calm, Headspace, Fabulous) are generic — none are built around the *specific emotional arc* of a breakup or toxic relationship.
- Existing breakup apps (e.g., Mend, BetterUp-style tools) lack gamification, community/social-proof (success stories), and a founder with a built-in, trusting audience.
- The founder's Instagram audience already primes the emotional need — the app converts an existing content relationship into a daily habit product.

**Core promise to the user:** "In 30, 60, or 90 days, you won't just move on — you'll become someone your ex doesn't recognize (in the best way)."

**Brand tone:** Warm, direct, empowering — equal parts best friend, therapist-adjacent guide, and hype woman. Never clinical, never preachy.

---

## 2. Target User & Personas

**Primary audience:** Women, 18–44, following the founder's Instagram content on breakups/toxic relationships/self-worth.

### Persona A — "Fresh Wound" (Sarah, 24)
Broke up 2–4 weeks ago. Checking his socials obsessively, can't sleep, needs constant distraction + reassurance. High emotional intensity, low patience for long content. **Needs:** Emergency motivation button, quick daily wins, validation.

### Persona B — "Stuck in the Loop" (Amanda, 32)
Left a toxic relationship 6+ months ago but still emotionally tangled — low self-worth, trust issues, repeating patterns in new relationships. **Needs:** Deeper healing program (60/90 day), journaling, pattern-recognition, therapy-adjacent tools.

### Persona C — "Rebuilding & Growing" (Jess, 28)
Emotionally past the breakup, now focused on becoming her best self — confidence, habits, discipline, glow-up. **Needs:** Habit tracking, morning/night routines, streaks, community success stories, long-term self-improvement content.

### Persona D — "Silent Struggler" (Maria, 40)
Long marriage/relationship ended, feels isolated, unsure how to "start over" at her age. **Needs:** Gentle tone, longer-form guidance, less gamified/childish UI options, strong support-system framing.

Design implication: onboarding must branch tone/pacing/program length based on which persona a user resembles (see Section 5).

---

## 3. Information Architecture — Full Screen List

### A. Pre-App / Onboarding (first launch)
1. Splash Screen
2. Welcome / Value Prop Carousel (3–4 slides)
3. Social Proof Screen ("Join 1M+ women healing with Move On" + testimonial snippets)
4. Onboarding Questionnaire (20–22 screens, one question per screen, progress bar)
5. "Analyzing your answers" loading/animation screen
6. Personalized Healing Plan Reveal screen (your program, your archetype, your starting stats)
7. Account Creation Screen (Clerk: Google / Apple / Email)
8. Notification Permission Priming Screen
9. Free Trial / Paywall Screen (3-Day Trial offer)
10. "Welcome, [Name]" — First Dashboard Tour (tooltips overlay)

### B. Core Navigation (Bottom Tab Bar)
- **Home / Dashboard**
- **Programs** (Challenges)
- **Journal & Track** (Journaling, Mood, Habits)
- **Calm** (Meditation, Breathing, Music, Sleep)
- **Profile / Progress**

### C. Home / Dashboard
11. Dashboard (streak, XP/level bar, today's mission, daily quote, mood check-in prompt, quick actions grid)
12. Daily Quote / Affirmation Full Screen (swipeable, shareable)
13. Daily Mission Detail Screen
14. Emergency Motivation Button — Full Screen Modal (breathing + quote + audio + "text a friend" prompt + grounding exercise)
15. Notification Center / Inbox

### D. Programs (Challenges)
16. Programs Home (30-Day Move On, 60-Day Healing, 90-Day Transformation, seasonal/limited challenges)
17. Program Detail / Overview Screen (curriculum, testimonials, lock/CTA if not subscribed)
18. Program Day Screen (today's task: reading + mission + journal prompt + audio)
19. Program Calendar / Progress Map (visual path, like a game board)
20. Program Completion / Certificate Screen

### E. Journal & Track
21. Journal Home (past entries, streak, prompts)
22. Guided Journal Entry Screen (prompt-based, voice-to-text option)
23. Free-write Journal Entry Screen
24. Journal Entry Detail / Edit Screen
25. Mood Tracker — Daily Check-in Screen (emoji/slider + tags: triggers, people, notes)
26. Mood History / Trends Screen (charts over week/month/year)
27. Habit Tracker Home (list of habits, add/edit habit)
28. Habit Detail Screen (streak, history, reminders)
29. Water Tracker Screen
30. Sleep Tracker Screen (bedtime/wake, quality rating, sleep sounds link)
31. Daily Gratitude Screen (3 things prompt, history)
32. Before/After Progress Screen (self-worth score, mood score, photos-optional private timeline, journaling word clouds)

### F. Calm / Wellness
33. Meditation Library Home (categories: healing, self-love, sleep, anxiety, letting go)
34. Meditation Player Screen
35. Breathing Exercises Home (box breathing, 4-7-8, etc.)
36. Breathing Exercise Player Screen (animated guide)
37. Positive Music Playlists Home
38. Playlist / Player Screen (or deep-link to Spotify/Apple Music)
39. Morning Routine Screen (checklist + guided flow)
40. Night Routine Screen (checklist + guided flow)
41. Sleep Sounds Screen

### G. Community & Inspiration
42. Success Stories Feed
43. Success Story Detail Screen
44. Submit Your Story Screen
45. Relationship Advice Library (categorized articles/short videos)
46. Advice Article/Video Detail Screen
47. Quotes Library (browse/search/filter by category)
48. Favorites Screen (saved quotes, articles, meditations, journal prompts)

### H. Profile / Progress / Gamification
49. Profile Home (avatar, name, level, XP bar, badges shelf, stats)
50. Level & XP Detail Screen (how leveling works, next rewards)
51. Achievements / Badges Screen
52. Streak Detail Screen (calendar heatmap)
53. Calendar Screen (unified view: missions, journal entries, mood, program days)
54. Personal Insights Screen (AI-generated pattern insights: "You feel best on days you journal in the morning")

### I. Settings & Account
55. Settings Home
56. Account / Edit Profile Screen
57. Subscription Management Screen
58. Notification Preferences Screen
59. Theme / Appearance Screen (dark mode, custom themes)
60. Language Selection Screen
61. Privacy & Data Screen (export/delete data)
62. Help / Support / Contact Screen
63. About / Legal (Terms, Privacy Policy)
64. Referral / Invite Friends Screen
65. Widget Setup Instructions Screen

### J. Monetization
66. Paywall Screen (full plan comparison)
67. Trial Ending Soon Modal
68. Special Offer / Win-back Modal
69. Purchase Confirmation Screen

### K. Search
70. Global Search Screen (quotes, articles, meditations, journal entries)

**Total: ~70 user-facing screens** (excluding admin panel, detailed separately in Section 13).

---

## 4. Onboarding Flow (20+ Questions)

Format: one question per screen, progress bar top, skip disabled for core questions, large tappable cards for options (not dropdowns), soft animated transitions. Tone shifts warm/validating based on answer given (micro-copy like "That takes courage to admit 💛" after toxic-relationship question).

| # | Question | Type | Options (≥3) |
|---|----------|------|---------------|
| 1 | What should we call you? | Free text | — |
| 2 | How old are you? | Single-select | 18–24 / 25–34 / 35–44 / 45+ |
| 3 | How do you identify? | Single-select | Woman / Man / Non-binary / Prefer not to say |
| 4 | What's your relationship status right now? | Single-select | Just broke up / Single & healing / In a relationship but struggling / Married or long-term & struggling / It's complicated |
| 5 | How long has it been since the breakup? | Single-select | Less than 1 month / 1–3 months / 3–6 months / 6–12 months / Over a year / Not applicable |
| 6 | Would you describe it as a toxic relationship? | Single-select | Yes, definitely / Somewhat / Not sure / No |
| 7 | How would you rate your mental health right now? | Single-select | Struggling a lot / Up and down / Managing okay / Feeling strong |
| 8 | What's your biggest struggle right now? | Multi-select | Letting go / Overthinking & missing them / Low self-worth / Anger or resentment / Loneliness / Trust issues |
| 9 | How's your sleep been lately? | Single-select | Terrible, can't sleep / Poor & restless / Okay / Good |
| 10 | What's your current stress level? | Slider (1–10) or Single-select | Low / Moderate / High / Overwhelming |
| 11 | How would you rate your anxiety? | Single-select | None / Mild / Moderate / Severe |
| 12 | What does your daily routine look like? | Single-select | No routine at all / Somewhat structured / Structured but numb / Structured & trying to heal |
| 13 | How confident do you feel right now? | Single-select | Very low / Low / Neutral / Growing / High |
| 14 | How motivated do you feel to change your life? | Single-select | I feel stuck / Some days good, some bad / Motivated but don't know how / Highly motivated |
| 15 | How would you describe your social life right now? | Single-select | I've isolated myself / I see people sometimes / I have a strong circle / I prefer being alone right now |
| 16 | Do you have someone to talk to about this? | Single-select | No one / A few people / A therapist or counselor / A strong support network |
| 17 | Have you tried healing methods before? | Multi-select | Therapy / Journaling / Self-help books or podcasts / Nothing yet |
| 18 | What's your main goal with Move On? | Multi-select | Move on from my ex / Build my self-worth / Break toxic patterns / Build better habits / Find inner peace / Become the best version of myself |
| 19 | How much time can you commit each day? | Single-select | 5 minutes / 10–15 minutes / 20–30 minutes / 30+ minutes |
| 20 | What kind of tone helps you most? | Single-select | Tough love / direct / Gentle & compassionate / Spiritual & mindful / Practical & action-based |
| 21 | Are you a morning or night person? | Single-select | Morning person / Night owl / Depends on the day |
| 22 | Anything we should be gentle about? (trigger topics) | Multi-select | Infidelity / Family / Marriage or divorce / Body image / None of these |

**Result screen:** shows a computed "Healing Archetype" (e.g., *The Rebuilder*, *The Warrior*, *The Quiet Healer*, *The Glow-Up Queen*), a recommended program length, and 3 starting stat bars (Self-Worth, Emotional Stability, Momentum) that will visibly grow over time — this creates immediate investment before the paywall.

---

## 5. Personalization Engine ("Healing Plan" Logic)

Onboarding answers feed a lightweight scoring model (can start rules-based, later ML-enhanced):

**Computed scores (0–100 each):**
- Heartbreak Intensity (Q4, Q5, Q6, Q8)
- Emotional Volatility (Q7, Q10, Q11)
- Self-Worth Baseline (Q13, Q8)
- Habit Readiness (Q12, Q19)
- Support Deficit (Q15, Q16)

**Routing logic:**
- High Heartbreak Intensity + recent breakup (< 1 month) → start on **30-Day Move On Challenge**, tone = validating/gentle, Emergency Button surfaced prominently, daily check-ins more frequent.
- Moderate intensity + toxic relationship flag + longer time elapsed → start on **60-Day Healing Program**, includes pattern-recognition journaling prompts and trust-rebuilding content.
- Low volatility + high motivation + growth-oriented goals → start on **90-Day Self-Transformation**, emphasis on habits, morning/night routines, confidence content.
- Support Deficit high → push Success Stories feed and community content harder; suggest daily gratitude + "you are not alone" push notifications.
- Preferred tone (Q20) sets the copywriting voice profile used across quotes, push notifications, and AI chat responses for that user.
- Time-commitment (Q19) sets default daily mission length (micro 3-min version vs. full version) and notification cadence.
- Trigger topics (Q22) suppress matching content categories app-wide.

**Output:** a generated "Healing Plan" page showing: assigned program, 3 focus areas, a first-week mini-curriculum, and a dynamic dashboard layout (e.g., users with poor sleep get Sleep Tracker + Sleep Sounds pinned to top of dashboard; users with low confidence get affirmations + confidence content pinned).

Plan re-calibrates every 2 weeks based on mood tracker + habit completion data ("Your plan just updated based on your progress").

---

## 6. Complete Feature Set

### 6.1 Daily Content
- Daily Motivational Quotes (push + in-app + shareable image card)
- Daily Healing Quotes (breakup-specific library, tagged by theme: letting go, self-worth, toxic patterns, hope)
- Daily Affirmations (spoken audio option + text, "repeat after me" mode)
- Relationship Advice Library (short articles/reels-style video snippets, categorized: red flags, healthy love, attachment styles, boundaries, dating again)
- Daily Missions (bite-sized tasks: "Block a number," "Write a letter you won't send," "Compliment yourself out loud")

### 6.2 Routines
- Morning Routine (customizable checklist: affirmation, gratitude, water, intention-setting)
- Night Routine (checklist: journal, gratitude, no-contact reminder, sleep sounds, tomorrow's intention)

### 6.3 Structured Programs
- 30-Day Move On Challenge (breakup-focused, daily curriculum)
- 60-Day Healing Program (deeper trauma/toxic-pattern focus)
- 90-Day Self-Transformation (confidence, habits, identity rebuild)
- Each program: daily unlock, lesson + mission + journal prompt + optional audio, visual progress map, completion badge/certificate, community cohort option (future)

### 6.4 Tracking Tools
- Guided Journaling (prompt library by mood/topic + free-write + voice-to-text)
- Mood Tracking (daily emoji/slider check-in, tags for triggers/people/context, trend charts)
- Habit Tracking (custom habits + suggested healing habits, streaks, reminders)
- Water Tracker
- Sleep Tracker (bedtime, quality, duration correlated with mood)
- Daily Gratitude (3 things per day, gratitude jar visualization)
- Before/After Progress (self-worth score over time, mood trend, optional private photo journal, word-cloud of journal themes)

### 6.5 Calm & Wellness
- Meditation Library (categorized: healing, self-love, anxiety relief, sleep, letting go, forgiveness)
- Breathing Exercises (box breathing, 4-7-8, animated guided visuals)
- Positive Music Playlists (curated in-app or deep-linked to Spotify/Apple Music)
- Sleep Sounds

### 6.6 Emotional Support Tools
- Emergency Motivation Button (one-tap: breathing exercise + curated quote + grounding script + optional AI chat + "call a friend/hotline resources" for crisis-level entries)
- Success Stories (real user transformation stories, filterable by situation)
- Before/After sharing (opt-in, privacy-first)

### 6.7 Gamification (detailed in Section 7)
- Daily Streak System, XP Points, Achievement Badges, Levels, Healing Archetypes

### 6.8 Organization & Utility
- Calendar (unified activity view)
- Personalized Dashboard
- Global Search
- Favorites (quotes, articles, meditations, journal prompts)
- Share Quotes (to Instagram Stories/other apps, pre-formatted)
- Download Quote Images (branded, watermark on free tier)
- Social Sharing of milestones/streaks/badges (opt-in, privacy-safe — no personal journal content ever shareable)

---

## 7. Gamification System

**Core loop:** Complete daily mission/journal/habit → earn XP → fill level bar → unlock badge/reward → streak increments → visible progress on dashboard & profile.

- **XP Points:** earned for check-ins (mood +5), journaling (+10), completing daily mission (+15), habit completion (+5 each), meditation/breathing session (+10), program day completed (+20), 7-day streak bonus (+50).
- **Levels:** 1–50, each with a title tied to the healing journey (e.g., Lv.1 "First Step," Lv.10 "Warrior," Lv.25 "Rebuilder," Lv.40 "Radiant," Lv.50 "Fully Healed & Thriving"). Leveling unlocks cosmetic app themes, new avatar frames, and bonus content (never gates core healing content behind level — only cosmetic/bonus).
- **Daily Streak System:** flame icon counter, streak freeze item (earn or premium perk) to protect against a missed day, milestone rewards at 3/7/14/30/60/90/180/365 days.
- **Achievement Badges:** e.g., "First Journal Entry," "7 Days No Contact," "30-Day Finisher," "Night Owl Healer," "Gratitude Master," "Consistency Queen," "Full Circle" (completed all 3 programs). Badge shelf on profile, shareable.
- **Healing Archetype:** assigned at onboarding, can evolve as user's stats change (e.g., from "The Fresh Wound" to "The Rebuilder" to "The Glow-Up").
- **Progress Stats:** Self-Worth, Emotional Stability, Momentum — visual bars on profile that move based on tracked activity, giving RPG-style visible growth to an intangible healing process.

---

## 8. AI Features

- **AI Healing Companion (chat):** conversational support trained on breakup/healing content + user's own onboarding profile and journal history (with consent) for context-aware responses. Not a therapy replacement — clear disclaimers, crisis-detection triggers hotline resources.
- **AI Journal Prompts:** dynamically generated prompts based on recent mood entries and program day (e.g., detects repeated "missing him" tags → suggests a targeted prompt).
- **AI Journal Reflection/Insights:** summarizes patterns across entries ("You mention feeling anxious most on Sundays — want a Sunday reset ritual?").
- **AI-Generated Personalized Affirmations:** based on user's stated struggles and goals, refreshed weekly.
- **AI Mood Pattern Detection:** correlates mood/sleep/habit data, surfaces insights on Personal Insights screen.
- **AI Quote Recommender:** learns which quote categories a user engages/saves most, biases daily quote feed.
- **Text-to-Speech for Affirmations/Meditations:** natural voice narration, multiple voice options (premium).
- **AI "Letter You'll Never Send" Generator:** guided AI-assisted cathartic writing exercise, kept fully private/local-only framing for trust.
- **Smart Notification Timing:** ML-optimized send-time per user based on historical open behavior.

*Guardrail:* All AI chat features include a visible disclaimer ("Move On's AI Companion offers support, not therapy") plus a crisis-resource surfacing rule (keywords trigger hotline/emergency contact suggestions instead of a normal AI reply).

---

## 9. Notifications Strategy

**Categories:**
- Daily Quote / Affirmation push (time based on onboarding morning/night preference)
- Daily Mission Reminder
- Streak-at-risk Reminder (evening, if no activity logged)
- Mood Check-in Prompt
- Program Day Unlocked
- Habit Reminders (per-habit custom time)
- Water/Sleep reminders
- Milestone Celebration (streak, level-up, badge earned)
- Success Story Spotlight (weekly, social-proof/motivation)
- Re-engagement / Win-back ("We miss you, [Name] — your streak is waiting")
- Trial ending / subscription renewal notices
- Emergency check-in on tough dates detected (e.g., anniversary date if user logged relationship start/end date — sensitive, opt-in only)

**Rules:** Fully configurable per-category in Settings; smart-bundling to avoid notification fatigue (max N per day default); tone matches user's selected archetype/voice profile.

---

## 10. Subscriptions & Monetization

| Plan | Price Positioning | Includes |
|------|-------------------|----------|
| **Free** | $0 | Daily quote (limited), 1 basic breathing exercise, mood tracker (basic), 3-day preview of 30-Day Challenge, watermarked quote image downloads, ads on quote/content screens (optional) |
| **3-Day Trial** | Free, card required | Full premium access, auto-converts to Monthly unless cancelled |
| **Monthly** | Premium pricing (e.g., $12.99–$16.99/mo tier) | Full access: all programs, AI companion, all tracking tools, no ads, HD quote downloads |
| **Yearly** | Discounted vs monthly (e.g., ~60% savings, billed annually) | Everything in Monthly + early access to new programs + yearly "Transformation Report" |
| **Lifetime (recommended addition)** | One-time premium price | Full access forever — strong impulse-purchase option for a highly engaged Instagram audience during launch promos |

**Paywall strategy:** Soft paywall after onboarding reveal (let users feel the personalized plan before asking to pay), hard paywall on Day 4 of any challenge, feature-gate AI companion and advanced tracking analytics behind premium from day one of free tier.

**Growth levers:** Founder-driven launch discount codes, referral program (give 1 month, get 1 month), annual "New Year, New Chapter" and "Valentine's Reset" seasonal campaigns, influencer/UGC success-story funnel back into Instagram content.

---

## 11. Premium Feature Breakdown & Long-Term Retention Hooks

**Standard premium (expected):** full programs, AI companion, ad-free, advanced tracking, HD downloads, custom themes, unlimited favorites/search history.

**Additional premium features to maximize multi-year retention:**
1. **Yearly "Transformation Report"** — a beautifully designed, shareable annual recap (à la Spotify Wrapped) of mood growth, streaks, journal word counts, milestones hit. Massive organic social sharing potential back to Instagram/TikTok.
2. **Anniversary Reflection** — on the 1-year mark of joining, auto-generates a "look how far you've come" comparison screen.
3. **Voice Journaling with AI Transcription & Summary.**
4. **Live/Cohort Challenges** — timed group challenges (e.g., "August Reset with 10,000 women") for community + FOMO-driven renewal timing.
5. **Expert/Coach Content Drops** — monthly guest content from therapists/coaches, framed as premium-exclusive drops to keep the library feeling alive.
6. **Personalized Healing Playlist curation** updated monthly by AI based on mood data.
7. **Family/Friend "Support Circle"** — invite a trusted friend to see (opt-in, limited) streak/mood-safe signals and send encouragement — adds social accountability without exposing journal privacy.
8. **Advanced Analytics Dashboard** — correlations between sleep/habits/mood, exportable PDF for personal therapy use.
9. **Exclusive Merch/Perks Tier** — top-tier annual subscribers get physical journal/merch drops or event access tied to the founder's brand.
10. **Multiple Profile Themes tied to Level/Archetype** — cosmetic progression that scales over years, not weeks.
11. **"No Contact" Tracker & Tools** — dedicated streak + blocking checklist + relapse-recovery flow (non-judgmental restart), a category-specific feature no generic wellness app has.
12. **Offline Full-Access Mode** for premium (entire library downloadable) — important for the emotional 2am use-case.
13. **Priority AI Companion** (faster responses, deeper memory/context across sessions) vs a lighter AI tier for base premium.

These are designed so the *value compounds over months/years* (Wrapped-style recaps, evolving archetypes, growing analytics history) rather than the app feeling "finished" after one 30-day cycle — directly targeting long-term subscription retention.

---

## 12. Authentication

- **Provider:** Clerk (handles session management, MFA-ready, user metadata storage for onboarding profile).
- **Sign-in methods:** Google OAuth, Apple Sign-In (required for iOS App Store compliance since Google/social login is offered), Email/Password, Magic Link (optional nice-to-have).
- **Flow:** Onboarding questionnaire can be completed *before* account creation (reduces friction, increases completion), account creation required only to save results/start trial. Guest-to-account data migration handled via Clerk user metadata merge.
- **Security:** Clerk-managed password hashing/session tokens; app never handles raw credentials directly (see security note below).

---

## 13. Admin Panel — Full Spec

Web-based admin dashboard (internal tool, role-based access) for the founder/content team to run the app without engineering help.

### 13.1 Modules

| Module | Capabilities |
|--------|--------------|
| **Quotes Manager** | CRUD quotes, tag by category/theme/archetype, schedule daily rotation, bulk CSV import, preview as push/quote-card |
| **Carousel / Content Posts** | Manage home-screen carousel banners, in-app promos, seasonal campaign creatives, schedule start/end dates |
| **Daily Tasks / Missions Manager** | CRUD daily missions, assign to programs or general pool, tag by difficulty/theme |
| **Challenges/Programs Manager** | Build/edit 30/60/90-day curriculum day-by-day (lesson, mission, journal prompt, audio upload), reorder days, publish/unpublish, view completion analytics per program |
| **Notifications Manager** | Compose/schedule push campaigns, segment by user cohort (archetype, subscription tier, engagement level, program stage), A/B test copy, view open/click rates |
| **Ads Manager** | Configure ad placements for free tier (network config, frequency caps), toggle ads on/off globally |
| **Users Manager** | Search/view user profiles, subscription status, activity/engagement stats, support actions (reset password trigger, refund flag, ban/suspend, manual trial extension), GDPR data export/delete requests |
| **Subscriptions Manager** | View/edit plan pricing tiers, promo codes, referral program config, revenue dashboard (MRR, churn, LTV), App Store/Play Store receipt reconciliation view |
| **Categories Manager** | Manage taxonomy used across quotes/articles/meditations/journal prompts (e.g., Letting Go, Self-Worth, Toxic Patterns, Confidence) |
| **AI Prompts Manager** | Edit system prompts/guardrails for AI Companion, manage crisis-keyword list and hotline resource copy per region/language, review flagged AI conversations (safety review queue) |
| **Success Stories Manager** | Review/approve user-submitted stories before publishing, feature/pin stories, moderate content |
| **Analytics Dashboard** | DAU/MAU, retention curves, funnel (onboarding completion → trial start → paid conversion), feature engagement heatmap, churn reasons (exit survey data), cohort analysis by archetype/program |
| **Languages/Localization Manager** | Manage translated strings/content per locale, translation completion status |
| **Roles & Permissions** | Admin, Content Editor, Support Agent, Analyst roles with scoped access |
| **Audit Log** | Track all admin actions for accountability |

### 13.2 Admin Panel Screens
1. Admin Login (separate from user app, MFA required)
2. Dashboard Overview (key metrics at a glance)
3. Quotes list/editor
4. Carousel/Promo editor
5. Daily Tasks list/editor
6. Programs/Challenges builder (day-by-day curriculum editor)
7. Notifications composer + campaign history
8. Ads config
9. Users list + user detail/support view
10. Subscriptions & revenue dashboard
11. Categories/taxonomy manager
12. AI prompts & safety review queue
13. Success stories moderation queue
14. Analytics & cohort explorer
15. Localization manager
16. Roles/permissions manager
17. Audit log viewer

---

## 14. Database Structure

Conceptual entity model (implementation-agnostic — maps cleanly to Postgres/Firestore/etc.).

### Users & Profile
- **users**: id, clerk_user_id, name, email, gender, age_range, created_at, last_active_at, locale, timezone
- **onboarding_responses**: id, user_id, question_key, answer_value(s), created_at
- **healing_profile**: id, user_id, archetype, heartbreak_intensity_score, emotional_volatility_score, self_worth_score, habit_readiness_score, support_deficit_score, tone_preference, recalculated_at
- **user_settings**: id, user_id, theme, dark_mode, language, notification_prefs (json), content_sensitivity_filters (json)

### Subscriptions
- **subscriptions**: id, user_id, plan_type (free/monthly/yearly/lifetime/trial), status, start_date, end_date, auto_renew, store_provider (app_store/play_store), receipt_ref
- **promo_codes**: id, code, discount_type, value, expires_at, usage_limit
- **referrals**: id, referrer_user_id, referred_user_id, reward_status

### Programs & Content
- **programs**: id, title, length_days (30/60/90), description, archetype_recommendation, is_published
- **program_days**: id, program_id, day_number, lesson_content, mission_id, journal_prompt_id, audio_url
- **user_program_progress**: id, user_id, program_id, current_day, started_at, completed_at, status
- **daily_missions**: id, title, description, xp_value, category, difficulty
- **user_mission_completions**: id, user_id, mission_id, completed_at
- **quotes**: id, text, category_id, tags (json), is_premium, created_by_admin_id
- **user_quote_favorites**: id, user_id, quote_id, saved_at
- **articles** (relationship advice): id, title, body, media_url, category_id, is_premium
- **meditations**: id, title, audio_url, category, duration_seconds, is_premium
- **playlists**: id, title, external_link_or_tracks (json), category
- **success_stories**: id, user_id (nullable if anonymous), title, body, status (pending/approved/featured), submitted_at
- **categories**: id, name, type (quote/article/meditation/prompt), parent_category_id

### Tracking & Journaling
- **journal_entries**: id, user_id, prompt_id (nullable for free-write), content, voice_transcript, created_at, mood_tag, is_private
- **journal_prompts**: id, text, category, tone_variant
- **mood_logs**: id, user_id, mood_score, mood_emoji, tags (json: triggers/people), note, logged_at
- **habits**: id, user_id, name, icon, target_frequency, reminder_time, created_at, archived_at
- **habit_logs**: id, habit_id, completed_at
- **water_logs**: id, user_id, amount_ml, logged_at
- **sleep_logs**: id, user_id, bedtime, wake_time, quality_rating, logged_at
- **gratitude_logs**: id, user_id, entries (json array of 3 items), logged_at
- **progress_snapshots**: id, user_id, self_worth_score, mood_avg, streak_count, snapshot_date (for Before/After + Yearly Wrapped)

### Gamification
- **xp_transactions**: id, user_id, source_type, source_id, xp_amount, created_at
- **user_levels**: id, user_id, current_level, current_xp, updated_at
- **badges**: id, name, description, icon, unlock_criteria (json)
- **user_badges**: id, user_id, badge_id, earned_at
- **streaks**: id, user_id, current_streak, longest_streak, last_active_date, streak_freezes_available

### AI & Notifications
- **ai_conversations**: id, user_id, started_at, ended_at, flagged_for_review (bool)
- **ai_messages**: id, conversation_id, sender (user/ai), content, created_at
- **notification_campaigns**: id, title, body_template, segment_filter (json), scheduled_at, sent_count, open_count
- **user_notification_log**: id, user_id, campaign_id/type, sent_at, opened_at

### Admin
- **admin_users**: id, name, email, role, created_at
- **audit_logs**: id, admin_user_id, action, target_entity, target_id, timestamp

---

## 15. Platform Capabilities

- **Push Notifications** — category-based opt-in, smart send-time (Section 9)
- **Offline Mode** — cached daily content, journal/mood/habit entries queued and synced when back online; full library download as a premium perk
- **Dark Mode** — system-default + manual override
- **Widgets** — Home screen widgets: Daily Quote, Streak Counter, Today's Mission, Mood Check-in Shortcut (iOS WidgetKit / Android App Widgets)
- **Multi-language** — launch with English + Spanish/Portuguese (large IG-audience overlap likely), architecture supports adding locales via Admin Localization Manager
- **Custom Themes** — unlockable via leveling, premium-exclusive palettes
- **Search** — global search across quotes/articles/meditations/journal history
- **Favorites** — unified saved-items screen across all content types
- **Share Quotes** — native share sheet + pre-formatted Instagram Story template
- **Download Quote Images** — branded image export, HD/no-watermark for premium
- **Social Sharing** — streaks, badges, level-ups, Transformation Report — never raw journal content (privacy-by-design)

---

## 16. Future Roadmap

**Phase 1 — Launch (MVP, 0–3 months)**
Onboarding + personalization engine, 30-Day Challenge, journaling, mood tracker, quotes/affirmations, basic gamification (XP/streaks/badges), Clerk auth, subscriptions (Free/Monthly/Yearly/Trial), core admin panel (content + users + notifications).

**Phase 2 — Depth (3–6 months)**
60-Day and 90-Day programs, AI Companion v1, habit/water/sleep trackers, meditation & breathing library, success stories community feature, referral program, widgets, dark mode.

**Phase 3 — Retention & Scale (6–12 months)**
Yearly Transformation Report, No-Contact Tracker, Support Circle (friend invites), advanced analytics dashboard, multi-language expansion, custom themes/cosmetic economy, live cohort challenges.

**Phase 4 — Ecosystem (12+ months)**
Apple Watch/Wear OS companion (quick mood log, breathing, streak glance), coach/therapist marketplace or content partnerships, community forums/moderated groups, merch/physical product tie-ins, web companion app, B2B2C partnership angle (e.g., therapy platforms), potential expansion vertical: "Move On for Men" or general breakup-agnostic "Move On: Life Transitions" (career loss, grief, friendship breakups) using the same engine.

---

## 17. Success Metrics / KPIs

- **Acquisition:** Onboarding completion rate, install → trial-start rate (target driven from IG funnel)
- **Activation:** Day-1 retention, % completing first journal/mood entry
- **Engagement:** DAU/MAU ratio, avg. daily missions completed, streak length distribution
- **Monetization:** Trial → paid conversion rate, Monthly → Yearly upgrade rate, churn rate by cohort/archetype, LTV by acquisition source
- **Retention (the core bet):** 30/60/90-day program completion rate, Year-1 renewal rate, Transformation Report share rate (proxy for organic growth loop back to Instagram)

---

*End of product plan. No code has been written — this document is scoped purely to product/feature/data/business planning as requested.*
