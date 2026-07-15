import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
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
import { useAnyScenario } from "@/hooks/useAllScenarios";
import { DifficultyBadge } from "@/components/DifficultyBadge";

export default function ScenarioDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scenario = useAnyScenario(id);

  if (!scenario) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Scenario not found</Text>
      </View>
    );
  }

  const handleStart = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.push(`/roleplay/${scenario.id}`);
  };

  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPadding + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.topCard,
            { backgroundColor: colors.primary + "08", borderColor: colors.primary + "20" },
          ]}
        >
          <View style={styles.badgeRow}>
            <DifficultyBadge difficulty={scenario.difficulty} />
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: colors.muted, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.categoryText, { color: colors.mutedForeground }]}>
                {scenario.category}
              </Text>
            </View>
            {"isCustom" in scenario && scenario.isCustom && (
              <View
                style={[
                  styles.customBadge,
                  { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" },
                ]}
              >
                <Feather name="settings" size={10} color={colors.primary} />
                <Text style={[styles.customBadgeText, { color: colors.primary }]}>
                  Custom
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>
            {scenario.title}
          </Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {scenario.description}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="clock" size={14} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                ~{scenario.estimatedMinutes} minutes
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Feather name="target" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Your Objective
            </Text>
          </View>
          <Text style={[styles.objectiveText, { color: colors.foreground }]}>
            {scenario.objective}
          </Text>
        </View>

        {scenario.hints.length > 0 && (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Feather name="list" size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Steps to Follow
              </Text>
            </View>
            {scenario.hints.map((hint, i) => (
              <View key={i} style={styles.hintRow}>
                <View
                  style={[
                    styles.stepBadge,
                    { backgroundColor: colors.primary + "15" },
                  ]}
                >
                  <Text style={[styles.stepNum, { color: colors.primary }]}>
                    {i + 1}
                  </Text>
                </View>
                <Text style={[styles.hintText, { color: colors.foreground }]}>
                  {hint}
                </Text>
              </View>
            ))}
          </View>
        )}

        {scenario.keyPhrases.length > 0 && (
          <View
            style={[
              styles.section,
              {
                backgroundColor: colors.accent + "08",
                borderColor: colors.accent + "20",
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Feather name="message-circle" size={16} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Key Phrases to Use
              </Text>
            </View>
            {scenario.keyPhrases.map((phrase, i) => (
              <View
                key={i}
                style={[
                  styles.phraseCard,
                  { borderLeftColor: colors.accent },
                ]}
              >
                <Text style={[styles.phraseText, { color: colors.foreground }]}>
                  "{phrase}"
                </Text>
              </View>
            ))}
          </View>
        )}

        <View
          style={[
            styles.warningCard,
            { backgroundColor: colors.warning + "10", borderColor: colors.warning + "30" },
          ]}
        >
          <Feather name="info" size={16} color={colors.warning} />
          <Text style={[styles.warningText, { color: colors.foreground }]}>
            You'll play the support agent. The AI will play the customer. Type your responses as you would on a real call.
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: bottomPadding + 16,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.primary }]}
          onPress={handleStart}
          activeOpacity={0.85}
        >
          <Feather name="phone-call" size={20} color={colors.primaryForeground} />
          <Text style={[styles.startText, { color: colors.primaryForeground }]}>
            Start Role Play
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 20 },
  topCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  categoryBadge: {
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  customBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  customBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginBottom: 8,
    lineHeight: 28,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  objectiveText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  stepNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  hintText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  phraseCard: {
    borderLeftWidth: 3,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  phraseText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  warningText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  startText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
  },
});
