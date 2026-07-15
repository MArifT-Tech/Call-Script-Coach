import { Feather } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
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
import { REFERENCE_SECTIONS, type RefSection } from "@/constants/reference";
import { ReferenceEntryCard } from "@/components/ReferenceEntryCard";

const SECTION_FILTERS = ["All", ...REFERENCE_SECTIONS.map((s) => s.title)];

export default function ReferenceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("All");
  const inputRef = useRef<TextInput>(null);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const filteredSections = useMemo(() => {
    const query = search.toLowerCase().trim();

    return REFERENCE_SECTIONS.map((section) => {
      const matchesSection =
        activeSection === "All" || section.title === activeSection;
      if (!matchesSection) return null;

      if (!query) return section;

      const matchedEntries = section.entries.filter(
        (e) =>
          e.label.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.value?.toLowerCase().includes(query) ||
          e.tags?.some((t) => t.toLowerCase().includes(query))
      );

      if (matchedEntries.length === 0) return null;
      return { ...section, entries: matchedEntries };
    }).filter((s): s is RefSection => s !== null);
  }, [search, activeSection]);

  const sectionByTitle = useMemo(() => {
    const map: Record<string, RefSection> = {};
    REFERENCE_SECTIONS.forEach((s) => { map[s.title] = s; });
    return map;
  }, []);

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
          PACS Reference
        </Text>
        <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
          Ports, AE Titles, Error Codes, DICOM Guide
        </Text>

        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search ports, errors, AE Titles..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={(t) => {
              setSearch(t);
              if (t) setActiveSection("All");
            }}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
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
          {REFERENCE_SECTIONS.map((section) => {
            const isActive = activeSection === section.title;
            return (
              <TouchableOpacity
                key={section.id}
                onPress={() => {
                  setActiveSection(isActive ? "All" : section.title);
                  setSearch("");
                }}
                style={[
                  styles.sectionChip,
                  {
                    backgroundColor: isActive
                      ? section.color
                      : colors.card,
                    borderColor: isActive ? section.color : colors.border,
                  },
                ]}
              >
                <Feather
                  name={section.icon as keyof typeof Feather.glyphMap}
                  size={13}
                  color={isActive ? "#fff" : section.color}
                />
                <Text
                  style={[
                    styles.sectionChipText,
                    { color: isActive ? "#fff" : colors.foreground },
                  ]}
                >
                  {section.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filteredSections.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="search" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No results
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Try searching for "104", "AE Title", "worklist", or "rejected"
            </Text>
          </View>
        ) : (
          filteredSections.map((section) => (
            <View key={section.id} style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionIcon,
                    { backgroundColor: section.color + "15" },
                  ]}
                >
                  <Feather
                    name={section.icon as keyof typeof Feather.glyphMap}
                    size={16}
                    color={section.color}
                  />
                </View>
                <Text
                  style={[styles.sectionTitle, { color: colors.foreground }]}
                >
                  {section.title}
                </Text>
                <View
                  style={[
                    styles.countBadge,
                    { backgroundColor: colors.muted },
                  ]}
                >
                  <Text
                    style={[styles.countText, { color: colors.mutedForeground }]}
                  >
                    {section.entries.length}
                  </Text>
                </View>
              </View>

              {section.entries.map((entry, i) => (
                <ReferenceEntryCard
                  key={i}
                  entry={entry}
                  accentColor={section.color}
                  searchQuery={search}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  sectionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  sectionChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  content: {
    padding: 20,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    flex: 1,
  },
  countBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
});
