import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useProgress } from "@/context/ProgressContext";
import { useAnyScenario } from "@/hooks/useAllScenarios";
import type { TranscriptMessage } from "@/context/ProgressContext";

export default function FeedbackScreen() {
  const params = useLocalSearchParams<{
    id: string;
    scenarioId: string;
    score: string;
    summary: string;
    strengths: string;
    improvements: string;
    messageCount: string;
    messagesJson: string;
  }>();

  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { saveSession } = useProgress();
  const savedSessionId = useRef<string | null>(null);
  const hasSaved = useRef(false);

  const scenarioId = params.scenarioId ?? params.id;
  const score = parseInt(params.score ?? "0", 10);
  const summary = params.summary ?? "";
  const strengths: string[] = JSON.parse(params.strengths ?? "[]");
  const improvements: string[] = JSON.parse(params.improvements ?? "[]");
  const messageCount = parseInt(params.messageCount ?? "0", 10);
  const messages: TranscriptMessage[] = params.messagesJson
    ? JSON.parse(params.messagesJson)
    : [];

  const scenario = useAnyScenario(scenarioId);

  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;

    const title = scenario?.title ?? "Unknown Scenario";
    saveSession({
      scenarioId,
      scenarioTitle: title,
      score,
      messageCount,
      summary,
      strengths,
      improvements,
      messages,
    }).then((record) => {
      savedSessionId.current = record.id;
    });

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(
        score >= 80
          ? Haptics.NotificationFeedbackType.Success
          : score >= 60
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Error
      );
    }
  }, []);

  const scoreColor =
    score >= 80 ? colors.success : score >= 60 ? colors.warning : colors.destructive;

  const scoreLabel =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work";

  const scoreEmoji = score >= 80 ? "🎉" : score >= 60 ? "👍" : "💪";

  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPadding + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.scoreCard,
            { backgroundColor: scoreColor + "10", borderColor: scoreColor + "30" },
          ]}
        >
          <View
            style={[
              styles.scoreCircle,
              { borderColor: scoreColor, backgroundColor: scoreColor + "15" },
            ]}
          >
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>
              {score}
            </Text>
            <Text style={[styles.scoreOutOf, { color: scoreColor + "80" }]}>
              /100
            </Text>
          </View>

          <Text style={[styles.scoreLabel, { color: scoreColor }]}>
            {scoreLabel}
          </Text>

          <Text style={[styles.scenarioTitle, { color: colors.foreground }]}>
            {scenario?.title ?? "Call Practice"}
          </Text>

          <Text style={[styles.summary, { color: colors.mutedForeground }]}>
            {summary}
          </Text>

          {messages.length > 0 && (
            <TouchableOpacity
              style={[
                styles.transcriptButton,
                {
                  backgroundColor: colors.background,
                  borderColor: scoreColor + "40",
                },
              ]}
              onPress={() => {
                if (savedSessionId.current) {
                  router.push(`/session/${savedSessionId.current}`);
                }
              }}
              activeOpacity={0.8}
            >
              <Feather name="message-square" size={15} color={scoreColor} />
              <Text style={[styles.transcriptButtonText, { color: scoreColor }]}>
                View Full Transcript ({messageCount} exchanges)
              </Text>
              <Feather name="chevron-right" size={15} color={scoreColor} />
            </TouchableOpacity>
          )}
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              What You Did Well
            </Text>
          </View>
          {strengths.length > 0 ? (
            strengths.map((s, i) => (
              <View key={i} style={styles.feedbackRow}>
                <Feather name="check-circle" size={16} color={colors.success} />
                <Text style={[styles.feedbackText, { color: colors.foreground }]}>
                  {s}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.feedbackText, { color: colors.mutedForeground }]}>
              Keep practicing to build your strengths.
            </Text>
          )}
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.dot, { backgroundColor: colors.warning }]} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Areas to Improve
            </Text>
          </View>
          {improvements.length > 0 ? (
            improvements.map((s, i) => (
              <View key={i} style={styles.feedbackRow}>
                <Feather name="arrow-up-circle" size={16} color={colors.warning} />
                <Text style={[styles.feedbackText, { color: colors.foreground }]}>
                  {s}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.feedbackText, { color: colors.mutedForeground }]}>
              Great work — no major improvements noted!
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.replace(`/scenario/${scenarioId}`)}
            activeOpacity={0.85}
          >
            <Feather name="refresh-cw" size={18} color={colors.primaryForeground} />
            <Text style={[styles.actionText, { color: colors.primaryForeground }]}>
              Try Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.replace("/")}
            activeOpacity={0.85}
          >
            <Feather name="list" size={18} color={colors.foreground} />
            <Text style={[styles.actionText, { color: colors.foreground }]}>
              All Scenarios
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 14 },
  scoreCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 12,
  },
  scoreNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 40,
    lineHeight: 46,
  },
  scoreOutOf: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  scoreLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    marginBottom: 8,
  },
  scenarioTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    marginBottom: 12,
    textAlign: "center",
  },
  summary: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 16,
  },
  transcriptButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  transcriptButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    flex: 1,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  feedbackText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  actions: { gap: 10, marginTop: 4 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 14,
  },
  actionText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});
