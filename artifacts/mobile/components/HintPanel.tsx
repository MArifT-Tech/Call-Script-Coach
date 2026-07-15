import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface HintPanelProps {
  hints: string[];
  keyPhrases: string[];
}

export function HintPanel({ hints, keyPhrases }: HintPanelProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      ]}
    >
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="list" size={14} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Steps to Follow
            </Text>
          </View>
          {hints.map((hint, i) => (
            <View key={i} style={styles.hintRow}>
              <View
                style={[
                  styles.stepNumber,
                  { backgroundColor: colors.primary + "15" },
                ]}
              >
                <Text
                  style={[styles.stepNumberText, { color: colors.primary }]}
                >
                  {i + 1}
                </Text>
              </View>
              <Text
                style={[styles.hintText, { color: colors.foreground }]}
              >
                {hint}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="message-circle" size={14} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.accent }]}>
              Key Phrases
            </Text>
          </View>
          {keyPhrases.map((phrase, i) => (
            <View
              key={i}
              style={[
                styles.phraseCard,
                {
                  backgroundColor: colors.accent + "10",
                  borderLeftColor: colors.accent,
                },
              ]}
            >
              <Text
                style={[styles.phraseText, { color: colors.foreground }]}
              >
                "{phrase}"
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    maxHeight: 300,
  },
  scroll: {
    padding: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumberText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  hintText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  phraseCard: {
    borderLeftWidth: 3,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  phraseText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    fontStyle: "italic",
  },
});
