import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
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
import { useAllScenarios } from "@/hooks/useAllScenarios";

function ScoreRing({
  score,
  hasTranscript,
}: {
  score: number;
  hasTranscript: boolean;
}) {
  const colors = useColors();
  const color =
    score >= 80
      ? colors.success
      : score >= 60
      ? colors.warning
      : colors.destructive;

  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      <View
        style={[
          styles.scoreRing,
          { borderColor: color + "40", backgroundColor: color + "10" },
        ]}
      >
        <Text style={[styles.scoreRingNum, { color }]}>{score}</Text>
      </View>
      {hasTranscript && (
        <Feather name="file-text" size={10} color={colors.mutedForeground} />
      )}
    </View>
  );
}

function MiniTrend({ scores }: { scores: number[] }) {
  const colors = useColors();
  if (scores.length < 2) return null;
  const last = scores[0];
  const prev = scores[1];
  const diff = last - prev;
  if (diff === 0) return null;
  return (
    <View style={styles.trendRow}>
      <Feather
        name={diff > 0 ? "trending-up" : "trending-down"}
        size={12}
        color={diff > 0 ? colors.success : colors.destructive}
      />
      <Text
        style={[
          styles.trendText,
          { color: diff > 0 ? colors.success : colors.destructive },
        ]}
      >
        {diff > 0 ? "+" : ""}
        {diff} from last
      </Text>
    </View>
  );
}

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sessions, clearHistory } = useProgress();
  const allScenarios = useAllScenarios();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const totalCompleted = sessions.length;
  const avgScore =
    sessions.length > 0
      ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length)
      : 0;
  const uniqueScenarios = new Set(sessions.map((s) => s.scenarioId)).size;
  const bestScore = sessions.length > 0 ? Math.max(...sessions.map((s) => s.score)) : 0;

  const scenarioStats = useMemo(() => {
    const map = new Map<
      string,
      { title: string; scores: number[]; attempts: number }
    >();
    for (const session of sessions) {
      if (!map.has(session.scenarioId)) {
        map.set(session.scenarioId, {
          title: session.scenarioTitle,
          scores: [],
          attempts: 0,
        });
      }
      const entry = map.get(session.scenarioId)!;
      entry.scores.push(session.score);
      entry.attempts++;
    }
    return Array.from(map.entries())
      .map(([id, data]) => ({
        id,
        title: data.title,
        best: Math.max(...data.scores),
        latest: data.scores[0],
        attempts: data.attempts,
        scores: data.scores,
      }))
      .sort((a, b) => b.best - a.best);
  }, [sessions]);

  const handleClear = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all your practice history? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => clearHistory(),
        },
      ]
    );
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const avgColor =
    avgScore >= 80
      ? colors.success
      : avgScore >= 60
      ? colors.warning
      : colors.destructive;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            paddingTop: topPadding + 16,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.heading, { color: colors.foreground }]}>
            My Progress
          </Text>
          {sessions.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Feather name="trash-2" size={18} color={colors.destructive} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {sessions.length === 0 ? (
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.primary + "10" },
              ]}
            >
              <Feather name="activity" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No sessions yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Complete a scenario practice to see your scores and full call transcripts here
            </Text>
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: colors.primary }]}
              onPress={() => router.replace("/")}
              activeOpacity={0.85}
            >
              <Feather name="play" size={16} color={colors.primaryForeground} />
              <Text style={[styles.startButtonText, { color: colors.primaryForeground }]}>
                Start Practicing
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {totalCompleted}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Total Sessions
                </Text>
              </View>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.statValue, { color: avgColor }]}>
                  {avgScore}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Avg Score
                </Text>
              </View>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  {uniqueScenarios}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Scenarios
                </Text>
              </View>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        bestScore >= 80
                          ? colors.success
                          : bestScore >= 60
                          ? colors.warning
                          : colors.destructive,
                    },
                  ]}
                >
                  {bestScore}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Best Score
                </Text>
              </View>
            </View>

            {scenarioStats.length > 0 && (
              <>
                <Text
                  style={[styles.sectionTitle, { color: colors.mutedForeground }]}
                >
                  SCENARIO BREAKDOWN
                </Text>
                {scenarioStats.map((stat) => {
                  const bestColor =
                    stat.best >= 80
                      ? colors.success
                      : stat.best >= 60
                      ? colors.warning
                      : colors.destructive;
                  return (
                    <TouchableOpacity
                      key={stat.id}
                      style={[
                        styles.scenarioStatCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => router.push(`/scenario/${stat.id}`)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.scenarioStatLeft}>
                        <Text
                          style={[
                            styles.scenarioStatTitle,
                            { color: colors.foreground },
                          ]}
                          numberOfLines={1}
                        >
                          {stat.title}
                        </Text>
                        <View style={styles.scenarioStatMeta}>
                          <Text
                            style={[
                              styles.scenarioStatAttempts,
                              { color: colors.mutedForeground },
                            ]}
                          >
                            {stat.attempts} attempt{stat.attempts !== 1 ? "s" : ""}
                          </Text>
                          <MiniTrend scores={stat.scores} />
                        </View>
                      </View>
                      <View style={styles.scenarioStatRight}>
                        <View
                          style={[
                            styles.bestBadge,
                            {
                              backgroundColor: bestColor + "12",
                              borderColor: bestColor + "30",
                            },
                          ]}
                        >
                          <Text
                            style={[styles.bestBadgeText, { color: bestColor }]}
                          >
                            Best: {stat.best}
                          </Text>
                        </View>
                        <Feather
                          name="chevron-right"
                          size={14}
                          color={colors.mutedForeground}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            <Text
              style={[
                styles.sectionTitle,
                { color: colors.mutedForeground, marginTop: 8 },
              ]}
            >
              RECENT SESSIONS
            </Text>

            {sessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={[
                  styles.sessionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => router.push(`/session/${session.id}`)}
                activeOpacity={0.75}
              >
                <View style={styles.sessionLeft}>
                  <Text
                    style={[styles.sessionTitle, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {session.scenarioTitle}
                  </Text>
                  <Text
                    style={[
                      styles.sessionMeta,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {formatDate(session.completedAt)} •{" "}
                    {session.messageCount} exchanges
                  </Text>
                  {session.summary && (
                    <Text
                      style={[
                        styles.sessionSummary,
                        { color: colors.mutedForeground },
                      ]}
                      numberOfLines={1}
                    >
                      {session.summary}
                    </Text>
                  )}
                </View>
                <View style={styles.sessionRight}>
                  <ScoreRing
                    score={session.score}
                    hasTranscript={
                      (session.messages?.length ?? 0) > 0
                    }
                  />
                  <Feather
                    name="chevron-right"
                    size={14}
                    color={colors.mutedForeground}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  content: { padding: 20 },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  startButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: "47.5%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  scenarioStatCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  scenarioStatLeft: { flex: 1, gap: 4 },
  scenarioStatTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  scenarioStatMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scenarioStatAttempts: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  trendText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  scenarioStatRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bestBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bestBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 10,
  },
  sessionLeft: { flex: 1, gap: 3 },
  sessionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  sessionMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  sessionSummary: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    fontStyle: "italic",
  },
  sessionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  scoreRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreRingNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
});
