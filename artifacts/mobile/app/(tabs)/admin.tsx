import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import {
  useCustomScenarios,
  type CustomScenario,
} from "@/context/CustomScenariosContext";
import { DifficultyBadge } from "@/components/DifficultyBadge";

const DIFFICULTY_COLORS = {
  easy: "#22C55E",
  medium: "#F59E0B",
  hard: "#EF4444",
};

function CustomScenarioCard({
  scenario,
  onEdit,
  onDelete,
}: {
  scenario: CustomScenario;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();
  const router = useRouter();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
        <TouchableOpacity
          style={styles.cardMain}
          onPress={() => router.push(`/scenario/${scenario.id}`)}
          activeOpacity={0.75}
        >
          <View style={styles.cardTop}>
            <DifficultyBadge difficulty={scenario.difficulty} size="sm" />
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
          </View>

          <Text
            style={[styles.cardTitle, { color: colors.foreground }]}
            numberOfLines={2}
          >
            {scenario.title}
          </Text>
          <Text
            style={[styles.cardDesc, { color: colors.mutedForeground }]}
            numberOfLines={2}
          >
            {scenario.description}
          </Text>

          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <Feather name="tag" size={12} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {scenario.category || "Uncategorized"}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="clock" size={12} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                ~{scenario.estimatedMinutes} min
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="list" size={12} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {scenario.hints.length} hints
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
            <Feather name="edit-2" size={15} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>
              Edit
            </Text>
          </TouchableOpacity>
          <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
            <Feather name="trash-2" size={15} color={colors.destructive} />
            <Text style={[styles.actionText, { color: colors.destructive }]}>
              Delete
            </Text>
          </TouchableOpacity>
          <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push(`/scenario/${scenario.id}`)}
          >
            <Feather name="play" size={15} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.success }]}>
              Practice
            </Text>
          </TouchableOpacity>
        </View>
      </View>
  );
}

export default function AdminScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { customScenarios, deleteScenario } = useCustomScenarios();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const handleDelete = (scenario: CustomScenario) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      "Delete Scenario",
      `Delete "${scenario.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteScenario(scenario.id),
        },
      ]
    );
  };

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
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.heading, { color: colors.foreground }]}>
              Custom Scenarios
            </Text>
            <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
              {customScenarios.length} custom •{" "}
              {customScenarios.length === 0
                ? "Build your first scenario"
                : "Tap to practice or edit"}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/admin/create")}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={20} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {customScenarios.length === 0 ? (
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.primary + "10" },
              ]}
            >
              <Feather name="plus-circle" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No custom scenarios yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Create scenarios tailored to your organisation — add your real PACS system names, AE Titles, server IPs, and site-specific issues.
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/admin/create")}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={16} color={colors.primaryForeground} />
              <Text style={[styles.emptyButtonText, { color: colors.primaryForeground }]}>
                Create First Scenario
              </Text>
            </TouchableOpacity>

            <View
              style={[
                styles.tipCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.tipHeader}>
                <Feather name="info" size={14} color={colors.accent} />
                <Text style={[styles.tipTitle, { color: colors.foreground }]}>
                  Tips for great custom scenarios
                </Text>
              </View>
              {[
                "Include your actual PACS name (e.g., Synapse, Sectra, Philips IntelliSpace)",
                "Add real AE Titles, server IPs, and site names your team uses daily",
                "Describe the caller's personality: level of technical knowledge and urgency",
                "Base scenarios on real past incidents from your support tickets",
              ].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View
                    style={[styles.tipDot, { backgroundColor: colors.accent }]}
                  />
                  <Text
                    style={[styles.tipText, { color: colors.mutedForeground }]}
                  >
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <>
            {customScenarios.map((scenario) => (
              <CustomScenarioCard
                key={scenario.id}
                scenario={scenario}
                onEdit={() =>
                  router.push(`/admin/edit/${scenario.id}`)
                }
                onDelete={() => handleDelete(scenario)}
              />
            ))}

            <TouchableOpacity
              style={[
                styles.addMoreButton,
                {
                  backgroundColor: colors.primary + "10",
                  borderColor: colors.primary + "30",
                },
              ]}
              onPress={() => router.push("/admin/create")}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={16} color={colors.primary} />
              <Text style={[styles.addMoreText, { color: colors.primary }]}>
                Create Another Scenario
              </Text>
            </TouchableOpacity>
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
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    marginBottom: 2,
  },
  subheading: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
  },
  empty: {
    alignItems: "center",
    paddingTop: 24,
    gap: 14,
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
    textAlign: "center",
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  tipCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  tipTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  tipDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
    flexShrink: 0,
  },
  tipText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
  },
  cardMain: {
    padding: 16,
  },
  cardTop: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  customBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    borderWidth: 1,
  },
  customBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 22,
  },
  cardDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  cardMeta: {
    flexDirection: "row",
    gap: 14,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  cardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 12,
  },
  actionText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  actionDivider: {
    width: 1,
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: 4,
  },
  addMoreText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
});
