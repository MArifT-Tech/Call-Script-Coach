import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import type { Scenario } from "@/constants/scenarios";
import { DifficultyBadge } from "./DifficultyBadge";

interface ScenarioCardProps {
  scenario: Scenario;
  bestScore: number | null;
  attemptCount: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ScenarioCard({ scenario, bestScore, attemptCount }: ScenarioCardProps) {
  const colors = useColors();
  const router = useRouter();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/scenario/${scenario.id}`);
  };

  const categoryIconMap: Record<string, string> = {
    "Account & Access": "key",
    Connectivity: "wifi",
    Hardware: "printer",
    Performance: "zap",
    Applications: "monitor",
    Billing: "credit-card",
    "Data Recovery": "hard-drive",
    Security: "shield",
  };

  const iconName = (categoryIconMap[scenario.category] ?? "help-circle") as keyof typeof Feather.glyphMap;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
      style={animatedStyle}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: 16,
          },
        ]}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.primary + "15" },
            ]}
          >
            <Feather name={iconName} size={20} color={colors.primary} />
          </View>
          <View style={styles.headerRight}>
            <DifficultyBadge difficulty={scenario.difficulty} size="sm" />
            {attemptCount > 0 && (
              <Text style={[styles.attempts, { color: colors.mutedForeground }]}>
                {attemptCount}x
              </Text>
            )}
          </View>
        </View>

        <Text
          style={[styles.title, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {scenario.title}
        </Text>
        <Text
          style={[styles.description, { color: colors.mutedForeground }]}
          numberOfLines={2}
        >
          {scenario.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.metaRow}>
            <Feather
              name="clock"
              size={12}
              color={colors.mutedForeground}
            />
            <Text
              style={[styles.metaText, { color: colors.mutedForeground }]}
            >
              ~{scenario.estimatedMinutes} min
            </Text>
          </View>

          {bestScore !== null && (
            <View style={styles.metaRow}>
              <Feather
                name="award"
                size={12}
                color={colors.warning}
              />
              <Text style={[styles.metaText, { color: colors.warning }]}>
                Best: {bestScore}
              </Text>
            </View>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  attempts: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    gap: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
});
