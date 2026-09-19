import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../../lib/useApi";
import { useOnboardingStore } from "../../state/onboardingStore";
import { useTheme } from "../../theme/ThemeContext";
import Screen from "../../components/ui/Screen";

export default function OnboardingScreen({ onComplete }) {
  const api = useApi();
  const { colors } = useTheme();
  const { answers, setAnswer, reset } = useOnboardingStore();
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [textValue, setTextValue] = useState("");

  const skipOnboarding = async () => {
    setSubmitting(true);
    try {
      await api("/api/onboarding/answers", { method: "POST", body: { answers: [] } });
      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  const loadQuestions = () => {
    setLoading(true);
    setLoadError(false);
    api("/api/onboarding/questions")
      .then(setQuestions)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  if (loading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "600", textAlign: "center", marginBottom: 8 }}>
            {loadError ? "Couldn't load onboarding" : "Nothing to answer yet"}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: "center", marginBottom: 20 }}>
            {loadError
              ? "Check your connection and try again."
              : "There are no onboarding questions set up right now."}
          </Text>
          {loadError && (
            <Pressable
              onPress={loadQuestions}
              style={{ backgroundColor: colors.accent, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 }}
            >
              <Text style={{ color: colors.accentText, fontWeight: "600" }}>Retry</Text>
            </Pressable>
          )}
          {!loadError && (
            <Pressable
              onPress={skipOnboarding}
              disabled={submitting}
              style={{
                backgroundColor: submitting ? colors.surfaceAlt : colors.accent,
                borderRadius: 14,
                paddingHorizontal: 24,
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: submitting ? colors.textMuted : colors.accentText, fontWeight: "600" }}>
                {submitting ? "Please wait..." : "Continue"}
              </Text>
            </Pressable>
          )}
        </View>
      </Screen>
    );
  }

  const question = questions[step];
  const total = questions.length;
  const progress = total ? (step + 1) / total : 0;
  const isLast = step === total - 1;
  const isChoice = question.type === "single_choice";
  const currentAnswer = answers[question?.id];
  const canContinue = isChoice ? !!currentAnswer : textValue.trim().length > 0;

  const goBack = () => {
    if (step === 0) return;
    setStep(step - 1);
    setTextValue(answers[questions[step - 1]?.id] || "");
  };

  const goNext = async () => {
    if (!isChoice) setAnswer(question.id, textValue.trim());

    if (!isLast) {
      setStep(step + 1);
      setTextValue(answers[questions[step + 1]?.id] || "");
      return;
    }

    setSubmitting(true);
    try {
      const finalAnswers = { ...answers };
      if (!isChoice) finalAnswers[question.id] = textValue.trim();
      const payload = Object.entries(finalAnswers).map(([questionId, answer]) => ({ questionId, answer }));
      await api("/api/onboarding/answers", { method: "POST", body: { answers: payload } });
      reset();
      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Pressable onPress={goBack} hitSlop={12} style={{ opacity: step === 0 ? 0 : 1 }}>
              <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
            </Pressable>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600", letterSpacing: 0.6 }}>
              {step + 1} OF {total}
            </Text>
          </View>
          <View style={{ height: 6, borderRadius: 6, backgroundColor: colors.surfaceAlt, overflow: "hidden" }}>
            <View
              style={{ height: 6, borderRadius: 6, width: `${progress * 100}%`, backgroundColor: colors.accent }}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, paddingVertical: 32 }}>
            <Text
              style={{
                fontSize: 26,
                lineHeight: 34,
                fontWeight: "700",
                color: colors.textPrimary,
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              {question.question}
            </Text>

            <View style={{ width: "100%", maxWidth: 420 }}>
              {isChoice && (
                <View>
                  {(question.options || []).map((opt) => {
                    const selected = currentAnswer === opt;
                    return (
                      <Pressable
                        key={opt}
                        onPress={() => setAnswer(question.id, opt)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderWidth: selected ? 0 : 1,
                          borderColor: colors.border,
                          backgroundColor: selected ? colors.accent : colors.surface,
                          borderRadius: 16,
                          paddingHorizontal: 20,
                          paddingVertical: 16,
                          marginBottom: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 15,
                            color: selected ? colors.accentText : colors.textPrimary,
                            fontWeight: selected ? "600" : "400",
                          }}
                        >
                          {opt}
                        </Text>
                        {selected && <Ionicons name="checkmark" size={18} color={colors.accentText} />}
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {!isChoice && (
                <TextInput
                  value={textValue}
                  onChangeText={setTextValue}
                  keyboardType={question.type === "number" ? "numeric" : "default"}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    fontSize: 15,
                    textAlign: "center",
                    color: colors.textPrimary,
                  }}
                  placeholder="Type your answer"
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                />
              )}
            </View>
          </View>
        </ScrollView>

        <View style={{ paddingHorizontal: 28, paddingBottom: 28, alignItems: "center" }}>
          <Pressable
            onPress={goNext}
            disabled={submitting || !canContinue}
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              backgroundColor: submitting || !canContinue ? colors.surfaceAlt : colors.accent,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: submitting || !canContinue ? colors.textMuted : colors.accentText,
              }}
            >
              {submitting ? "Saving..." : isLast ? "Finish" : "Continue"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
