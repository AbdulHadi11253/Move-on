// Turns raw progress numbers into an encouraging headline + subtitle so the
// Progress screen motivates rather than just showing digits.
export function getMotivation({ currentDay = 0, percentComplete = 0, streak = 0 } = {}) {
  if (percentComplete >= 100)
    return { emoji: "💜", title: "You did it.", subtitle: "You completed your whole journey. Look how far you've come." };
  if (percentComplete >= 75)
    return { emoji: "🌅", title: "The hardest part is behind you.", subtitle: "You're so close now. Keep choosing yourself." };
  if (percentComplete >= 50)
    return { emoji: "⛰️", title: "Halfway there — and stronger.", subtitle: "Every single day you're proving you can do this." };
  if (streak >= 7)
    return { emoji: "🔥", title: `${streak} days strong.`, subtitle: "Consistency is quietly rebuilding you." };
  if (currentDay >= 3)
    return { emoji: "🌱", title: "You're building momentum.", subtitle: "A few days in and still here. That matters more than you know." };
  if (currentDay >= 1)
    return { emoji: "✨", title: "Day one is the bravest.", subtitle: "You showed up for yourself today. That's how healing begins." };
  return { emoji: "💫", title: "One day at a time.", subtitle: "You're doing better than you think." };
}

// Reward badges that unlock as the user progresses. Locked ones stay visible
// (greyed out) so there's always something to reach for.
export function getAchievements({ currentDay = 0, streak = 0, percentComplete = 0 } = {}) {
  return [
    { key: "first_step", label: "First Step", icon: "footsteps", unlocked: currentDay >= 1 },
    { key: "three_days", label: "3 Days", icon: "leaf", unlocked: currentDay >= 3 },
    { key: "one_week", label: "1 Week", icon: "flame", unlocked: currentDay >= 7 || streak >= 7 },
    { key: "halfway", label: "Halfway", icon: "ribbon", unlocked: percentComplete >= 50 },
    { key: "two_weeks", label: "2 Weeks", icon: "shield-checkmark", unlocked: currentDay >= 14 },
    { key: "completed", label: "Completed", icon: "trophy", unlocked: percentComplete >= 100 },
  ];
}
