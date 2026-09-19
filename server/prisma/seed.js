const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ONBOARDING_QUESTIONS = [
  { order: 1, question: "What's your name?", type: "text" },
  { order: 2, question: "How old are you?", type: "number" },
  { order: 3, question: "What's your gender?", type: "single_choice", options: ["Male", "Female", "Other", "Prefer not to say"] },
  { order: 4, question: "Why are you here?", type: "single_choice", options: ["Breakup", "Toxic relationship", "Overthinking", "Low confidence", "General self-growth"] },
  { order: 5, question: "How long was your relationship?", type: "single_choice", options: ["Less than 6 months", "6 months - 2 years", "2 - 5 years", "More than 5 years"] },
  { order: 6, question: "How long ago did it end?", type: "single_choice", options: ["This week", "This month", "A few months ago", "Over a year ago"] },
  { order: 7, question: "How would you describe your current emotional state?", type: "single_choice", options: ["Sad", "Angry", "Numb", "Hopeful", "Anxious"] },
  { order: 8, question: "What's your biggest struggle right now?", type: "single_choice", options: ["Missing them", "Overthinking", "Low self-worth", "Loneliness", "Anger"] },
  { order: 9, question: "How motivated are you to move forward?", type: "single_choice", options: ["Very motivated", "Somewhat motivated", "Not sure yet"] },
  { order: 10, question: "How much time can you commit daily?", type: "single_choice", options: ["5 minutes", "10 minutes", "15+ minutes"] },
];

const QUOTES = [
  { text: "You are allowed to be both a masterpiece and a work in progress.", author: "Sophia Bush" },
  { text: "The best is yet to come.", author: null },
  { text: "Healing is not linear.", author: null },
  { text: "Letting go is the hardest form of self-love.", author: null },
  { text: "You survived every hard day so far. That's undefeated.", author: null },
  { text: "Every day you choose yourself is a day you get stronger.", author: null },
];

const TASKS = [
  { title: "Take a 10-minute walk", category: "movement" },
  { title: "Drink 8 glasses of water today", category: "wellness" },
  { title: "Write down 3 things you're grateful for", category: "journal" },
  { title: "Read for 10 minutes", category: "growth" },
  { title: "Avoid checking your ex's profile today", category: "boundaries" },
  { title: "Text a friend who makes you laugh", category: "connection" },
];

const APP_CONTENT = [
  {
    key: "home_no_journey",
    label: "Home — No Active Journey",
    title: "Welcome",
    subtitle: "Choose a recovery journey to get started. You can always switch later.",
    buttonLabel: "Choose Your Journey",
  },
  {
    key: "progress_no_journey",
    label: "Progress — No Active Journey",
    title: null,
    subtitle: "You don't have an active journey yet.",
    buttonLabel: "Choose your journey",
  },
  {
    key: "journey_picker_header",
    label: "Journey Picker — Header",
    title: "Choose your journey",
    subtitle: "Pick the path that fits where you are right now. You can switch later.",
    buttonLabel: null,
  },
  {
    key: "start_recovery_button",
    label: "Start Recovery Button — Messages",
    title: "Hold to Heal",
    subtitle: "You are choosing yourself",
    buttonLabel: "Done",
  },
  {
    key: "home_carousel_limit",
    label: "Home — Number of Carousels to Show",
    title: "3",
    subtitle: null,
    buttonLabel: null,
  },
  {
    key: "home_single_post_limit",
    label: "Home — Number of Single Posts to Show",
    title: "5",
    subtitle: null,
    buttonLabel: null,
  },
  {
    key: "home_today_quote",
    label: "Home — Today's Quote Section",
    title: null,
    subtitle: null,
    buttonLabel: null,
  },
];

const LESSONS = [
  { title: "Why healing isn't a straight line", content: "Healing comes in waves, not a straight line upward. Some days will feel like progress, others like a setback — both are part of the same process.", category: "healing", readMinutes: 3 },
  { title: "Rebuilding your self-worth", content: "Self-worth isn't given to you by someone else, and it isn't taken away by someone leaving. It's something you rebuild, one honest choice at a time.", category: "self-worth", readMinutes: 4 },
  { title: "Setting boundaries that stick", content: "Boundaries protect your peace. They aren't about punishing anyone — they're about deciding what you will and won't allow into your life going forward.", category: "boundaries", readMinutes: 3 },
];

async function buildJourney({ title, description, audience, totalDays, previewDays }) {
  const journey = await prisma.journey.create({
    data: { title, description, audience, totalDays },
  });

  const quotes = await prisma.quote.findMany();
  const tasks = await prisma.task.findMany();
  const lessons = await prisma.lesson.findMany();

  for (let day = 1; day <= previewDays; day++) {
    const journeyDay = await prisma.journeyDay.create({
      data: { journeyId: journey.id, dayNumber: day },
    });

    await prisma.journeyDayQuote.create({
      data: { journeyDayId: journeyDay.id, quoteId: quotes[(day - 1) % quotes.length].id },
    });
    await prisma.journeyDayTask.create({
      data: { journeyDayId: journeyDay.id, taskId: tasks[(day - 1) % tasks.length].id },
    });
    await prisma.journeyDayLesson.create({
      data: { journeyDayId: journeyDay.id, lessonId: lessons[(day - 1) % lessons.length].id },
    });

    // Day 2 demonstrates multiple items assigned to a single day
    if (day === 2) {
      await prisma.journeyDayTask.create({
        data: { journeyDayId: journeyDay.id, taskId: tasks[(day) % tasks.length].id },
      });
      await prisma.journeyDayQuote.create({
        data: { journeyDayId: journeyDay.id, quoteId: quotes[(day) % quotes.length].id },
      });
    }
  }

  return journey;
}

async function main() {
  for (const c of APP_CONTENT) {
    await prisma.appContent.upsert({
      where: { key: c.key },
      update: {},
      create: c,
    });
  }

  for (const q of ONBOARDING_QUESTIONS) {
    await prisma.onboardingQuestion.upsert({
      where: { order: q.order },
      update: q,
      create: q,
    });
  }

  for (const q of QUOTES) {
    await prisma.quote.create({ data: q });
  }
  for (const t of TASKS) {
    await prisma.task.create({ data: t });
  }
  for (const l of LESSONS) {
    await prisma.lesson.create({ data: l });
  }

  await buildJourney({
    title: "30-Day Recovery Journey",
    description: "A structured, well-paced path to move on in 30 days.",
    audience: "Anyone recovering from a recent breakup",
    totalDays: 30,
    previewDays: 5,
  });

  await buildJourney({
    title: "21-Day Reset",
    description: "A faster reset for people who want quick momentum.",
    audience: "People who want a shorter, intensive reset",
    totalDays: 21,
    previewDays: 5,
  });

  await buildJourney({
    title: "6-Month Rebuild",
    description: "A slower, deeper journey for long-term relationships and lasting change.",
    audience: "People rebuilding after a long-term relationship or toxic dynamic",
    totalDays: 180,
    previewDays: 5,
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
