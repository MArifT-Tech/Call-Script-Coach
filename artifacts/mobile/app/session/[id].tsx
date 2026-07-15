import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect } from "react";
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

function ScorePill({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md";
}) {
  const colors = useColors();
  const color =
    score >= 80
      ? colors.success
      : score >= 60
      ? colors.warning
      : colors.destructive;
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work";

  return (
    <View
      style={[
        styles.scorePill,
        { backgroundColor: color + "15", borderColor: color + "30" },
        size === "sm" && styles.scorePillSm,
      ]}
    >
      <Text
        style={[
          styles.scorePillNum,
          { color },
          size === "sm" && styles.scorePillNumSm,
        ]}
      >
        {score}
      </Text>
      <Text
        style={[
          styles.scorePillLabel,
          { color },
          size === "sm" && styles.scorePillLabelSm,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function MessageRow({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const colors = useColors();
  const isAgent = role === "user";

  return (
    <View style={[styles.msgRow, isAgent && styles.msgRowAgent]}>
      {!isAgent && (
        <View
          style={[
            styles.msgAvatar,
            { backgroundColor: colors.accent + "20" },
          ]}
        >
          <Feather name="user" size={13} color={colors.accent} />
        </View>
      )}

      <View
        style={[
          styles.msgBubble,
          {
            backgroundColor: isAgent ? colors.primary : colors.card,
            borderColor: isAgent ? "transparent" : colors.border,
            borderWidth: isAgent ? 0 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.msgLabel,
            { color: isAgent ? colors.primaryForeground + "80" : colors.mutedForeground },
          ]}
        >
          {isAgent ? "You (Agent)" : "Customer"}
        </Text>
        <Text
          style={[
            styles.msgContent,
            {
              color: isAgent ? colors.primaryForeground : colors.foreground,
            },
          ]}
        >
          {content}
        </Text>
      </View>

      {isAgent && (
        <View
          style={[
            styles.msgAvatar,
            { backgroundColor: colors.primary + "20" },
          ]}
        >
          <Feather name="headphones" size={13} color={colors.primary} />
        </View>
      )}
    </View>
  );
}

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { getSession } = useProgress();

  const session = getSession(id);

  useEffect(() => {
    navigation.setOptions({
      title: "Session Review",
    });
  }, [navigation]);

  if (!session) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="inbox" size={40} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>
          Session not found
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const scoreColor =
    session.score >= 80
      ? colors.success
      : session.score >= 60
      ? colors.warning
      : colors.destructive;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;
  const agentTurns = session.messages?.filter((m) => m.role === "user") ?? [];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: bottomPadding + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: scoreColor + "08",
            borderColor: scoreColor + "25",
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.scenarioTitle, { color: colors.foreground }]}>
              {session.scenarioTitle}
            </Text>
            <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
              {formatDate(session.completedAt)}
            </Text>
          </View>
          <View
            style={[
              styles.bigScore,
              {
                backgroundColor: scoreColor + "15",
                borderColor: scoreColor + "30",
              },
            ]}
          >
            <Text style={[styles.bigScoreNum, { color: scoreColor }]}>
              {session.score}
            </Text>
            <Text style={[styles.bigScoreLabel, { color: scoreColor }]}>
              /100
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Feather name="message-circle" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaChipText, { color: colors.mutedForeground }]}>
              {agentTurns.length} agent turns
            </Text>
          </View>
          <View style={styles.metaChip}>
            <Feather name="clock" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaChipText, { color: colors.mutedForeground }]}>
              {(session.messages?.length ?? 0)} total messages
            </Text>
          </View>
        </View>

        {session.summary && (
          <Text style={[styles.summaryText, { color: colors.foreground }]}>
            {session.summary}
          </Text>
        )}
      </View>

      {(session.strengths?.length ?? 0) > 0 && (
        <View
          style={[
            styles.feedbackSection,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.feedbackHeader}>
            <Feather name="check-circle" size={16} color={colors.success} />
            <Text style={[styles.feedbackTitle, { color: colors.foreground }]}>
              What You Did Well
            </Text>
          </View>
          {session.strengths!.map((s, i) => (
            <View key={i} style={styles.feedbackRow}>
              <View
                style={[styles.feedbackDot, { backgroundColor: colors.success }]}
              />
              <Text style={[styles.feedbackText, { color: colors.foreground }]}>
                {s}
              </Text>
            </View>
          ))}
        </View>
      )}

      {(session.improvements?.length ?? 0) > 0 && (
        <View
          style={[
            styles.feedbackSection,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.feedbackHeader}>
            <Feather name="arrow-up-circle" size={16} color={colors.warning} />
            <Text style={[styles.feedbackTitle, { color: colors.foreground }]}>
              Areas to Improve
            </Text>
          </View>
          {session.improvements!.map((s, i) => (
            <View key={i} style={styles.feedbackRow}>
              <View
                style={[styles.feedbackDot, { backgroundColor: colors.warning }]}
              />
              <Text style={[styles.feedbackText, { color: colors.foreground }]}>
                {s}
              </Text>
            </View>
          ))}
        </View>
      )}

      {(session.messages?.length ?? 0) > 0 ? (
        <View>
          <View style={styles.transcriptHeader}>
            <Feather name="message-square" size={15} color={colors.mutedForeground} />
            <Text
              style={[styles.transcriptTitle, { color: colors.mutedForeground }]}
            >
              FULL TRANSCRIPT
            </Text>
          </View>

          <View style={styles.transcriptContainer}>
            {session.messages!.map((msg, i) => (
              <MessageRow key={i} role={msg.role} content={msg.content} />
            ))}
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.noTranscript,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="info" size={16} color={colors.mutedForeground} />
          <Text style={[styles.noTranscriptText, { color: colors.mutedForeground }]}>
            Transcript not available for this session
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.practiceButton,
          { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" },
        ]}
        onPress={() => router.push(`/scenario/${session.scenarioId}`)}
        activeOpacity={0.8}
      >
        <Feather name="refresh-cw" size={16} color={colors.primary} />
        <Text style={[styles.practiceButtonText, { color: colors.primary }]}>
          Practice This Scenario Again
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  headerCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  scenarioTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 4,
  },
  dateText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  bigScore: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    flexDirection: "row",
  },
  bigScoreNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
  },
  bigScoreLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    alignSelf: "flex-end",
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaChipText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  summaryText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },
  scorePill: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
  },
  scorePillSm: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scorePillNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
  },
  scorePillNumSm: { fontSize: 16 },
  scorePillLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  scorePillLabelSm: { fontSize: 10 },
  feedbackSection: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  feedbackTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  feedbackDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  feedbackText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  transcriptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    marginTop: 4,
  },
  transcriptTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.8,
  },
  transcriptContainer: {
    gap: 10,
  },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  msgRowAgent: {
    flexDirection: "row-reverse",
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  msgBubble: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    maxWidth: "85%",
  },
  msgLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  msgContent: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  noTranscript: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  noTranscriptText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    flex: 1,
  },
  practiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  practiceButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
