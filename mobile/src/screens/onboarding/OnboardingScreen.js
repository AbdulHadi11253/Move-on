import { useEffect, useMemo, useState } from "react";
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
import { publicFetch } from "../../lib/api";
import { useOnboardingStore } from "../../state/onboardingStore";
import { useTheme } from "../../theme/ThemeContext";
import Screen from "../../components/ui/Screen";

// Shown before sign-in. Questions come in batches (set by the admin); a short
// interstitial separates batches. onComplete fires after the final answer,
// onNoQuestions when none are configured, onHaveAccount lets returning users
// skip straight to sign-in.
export default function OnboardingScreen({ onComplete, onNoQuestions, onHaveAccount }) {
  const { colors } = useTheme();
  const { answers, setAnswer } = useOnboardingStore();
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [textValue, setTextValue] = useState("");
  const [showIntro, setShowIntro] = useState(false);

  const loadQuestions = () => {
    setLoading(true);
    setLoadError(false);
    publicFetch("/api/onboarding/questions")
      .then((qs) => {
        setQuestions(qs);
        if (qs.length === 0) onNoQuestions?.();
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };

  useEffect(loadQuestions, []);

  const batches = useMemo(() => [...new Set(questions.map((q) => q.batch))], [questions]);
  const multiBatch = batches.length > 1;

  if (loading || (!loadError && questions.length === 0)) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    );
  }

  if (loadError) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: "600", textAlign: "center", marginBottom: 8 }}>
            Couldn't load the questions
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: "center", marginBottom: 20 }}>
            Check your connection and try again.
          </Text>
          <Pressable
            onPress={loadQuestions}
            style={{ backgroundColor: colors.accent, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 }}
          >
            <Text style={{ color: colors.accentText, fontWeight: "600" }}>Retry</Text>
          </Pressable>
          {onHaveAccount && (
            <Pressable onPress={onHaveAccount} hitSlop={10} style={{ marginTop: 20 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>I already have an account</Text>
            </Pressable>
          )}
        </View>
      </Screen>
    );
  }

  const question = questions[step];
  const total = questions.length;
  const isLast = step === total - 1;
  const isSingle = question.type === "single_choice";
  const isMulti = question.type === "multi_choice";
  const isChoice = isSingle || isMulti;
  const currentAnswer = answers[question.id];
  const selectedMulti = isMulti && currentAnswer ? currentAnswer.split(", ") : [];
  const canContinue = isChoice ? !!currentAnswer : textValue.trim().length > 0;

  const restoreText = (idx) => {
    const q = questions[idx];
    const isText = q && q.type !== "single_choice" && q.type !== "multi_choice";
    setTextValue(isText ? answers[q.id] || "" : "");
  };

  const goBack = () => {
    if (showIntro) {
      setShowIntro(false);
      return;
    }
    if (step === 0) return;
    setStep(step - 1);
    restoreText(step - 1);
  };

  const goNext = () => {
    if (!isChoice) setAnswer(question.id, textValue.trim());
    if (isLast) {
      onComplete();
      return;
    }
    const next = questions[step + 1];
    setStep(step + 1);
    restoreText(step + 1);
    if (multiBatch && next.batch !== question.batch) setShowIntro(true);
  };

  const toggleMulti = (opt) => {
    const next = selectedMulti.includes(opt) ? selectedMulti.filter((o) => o !== opt) : [...selectedMulti, opt];
    setAnswer(question.id, next.join(", "));
  };

  if (showIntro) {
    const upcoming = batches.indexOf(question.batch) + 1;
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: colors.accentSoft,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Ionicons name="sparkles" size={28} color={colors.accent} />
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 0.8, marginBottom: 8 }}>
            PART {upcoming} OF {batches.length}
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: 26, fontWeight: "700", textAlign: "center", marginBottom: 10 }}>
            A few more questions
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: "center", marginBottom: 32 }}>
            This helps us shape your recovery journey around you.
          </Text>
          <Pressable
            onPress={() => setShowIntro(false)}
            style={{ backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48 }}
          >
            <Text style={{ color: colors.accentText, fontSize: 15, fontWeight: "600" }}>Continue</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

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
            <View style={{ height: 6, borderRadius: 6, width: `${((step + 1) / total) * 100}%`, backgroundColor: colors.accent }} />
          </View>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, paddingVertical: 32 }}>
            <Text
              style={{
                fontSize: 26,
                lineHeight: 34,
                fontWeight: "700",
                color: colors.textPrimary,
                textAlign: "center",
                marginBottom: isMulti ? 8 : 32,
              }}
            >
              {question.question}
            </Text>
            {isMulti && <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 24 }}>Select all that apply</Text>}

            <View style={{ width: "100%", maxWidth: 420 }}>
              {isChoice &&
                (question.options || []).map((opt) => {
                  const selected = isMulti ? selectedMulti.includes(opt) : currentAnswer === opt;
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => (isMulti ? toggleMulti(opt) : setAnswer(question.id, opt))}
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
            disabled={!canContinue}
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              backgroundColor: canContinue ? colors.accent : colors.surfaceAlt,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "600", color: canContinue ? colors.accentText : colors.textMuted }}>
              {isLast ? "Finish" : "Continue"}
            </Text>
          </Pressable>
          {step === 0 && onHaveAccount && (
            <Pressable onPress={onHaveAccount} hitSlop={10} style={{ marginTop: 16 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>I already have an account</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
