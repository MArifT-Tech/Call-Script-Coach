import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { SCENARIOS } from "@/constants/scenarios";
import type { Difficulty } from "@/constants/scenarios";
import { ScenarioCard } from "@/components/ScenarioCard";
import { useProgress } from "@/context/ProgressContext";
import { useCustomScenarios } from "@/context/CustomScenariosContext";

const DIFFICULTIES: Array<Difficulty | "all"> = ["all", "easy", "medium", "hard"];

export default function ScenariosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getBestScore, getAttemptCount } = useProgress();
  const { customScenarios } = useCustomScenarios();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Difficulty | "all">("all");

  const allScenarios = useMemo(
    () => [...SCENARIOS, ...customScenarios],
    [customScenarios]
  );

  const filtered = useMemo(() => {
    return allScenarios.filter((s) => {
      const matchesDiff = filter === "all" || s.difficulty === filter;
      const matchesSearch =
        search.trim() === "" ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase());
      return matchesDiff && matchesSearch;
    });
  }, [search, filter, allScenarios]);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

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
        <Text style={[styles.heading, { color: colors.foreground }]}>
          Training Scenarios
        </Text>
        <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
          {allScenarios.length} scenarios
          {customScenarios.length > 0
            ? ` • ${customScenarios.length} custom`
            : " • PACS Support"}
        </Text>

        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search scenarios..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {DIFFICULTIES.map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setFilter(d)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    filter === d ? colors.primary : colors.card,
                  borderColor:
                    filter === d ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      filter === d
                        ? colors.primaryForeground
                        : colors.mutedForeground,
                  },
                ]}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {customScenarios.length > 0 && filter === "all" && !search && (
          <View style={styles.sectionLabel}>
            <Feather name="settings" size={13} color={colors.primary} />
            <Text style={[styles.sectionLabelText, { color: colors.primary }]}>
              Custom ({customScenarios.length})
            </Text>
          </View>
        )}

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="inbox" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No scenarios found
            </Text>
          </View>
        ) : (
          filtered.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              bestScore={getBestScore(scenario.id)}
              attemptCount={getAttemptCount(scenario.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    zIndex: 1,
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    marginBottom: 2,
  },
  subheading: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    padding: 0,
  },
  filterScroll: {
    marginHorizontal: -20,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  sectionLabelText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
});
