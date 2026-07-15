import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Difficulty } from "@/constants/scenarios";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  size?: "sm" | "md";
}

export function DifficultyBadge({ difficulty, size = "md" }: DifficultyBadgeProps) {
  const colors = useColors();

  const config = {
    easy: { label: "Easy", color: colors.success },
    medium: { label: "Medium", color: colors.warning },
    hard: { label: "Hard", color: colors.destructive },
  };

  const { label, color } = config[difficulty];
  const isSmall = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color + "20",
          borderColor: color + "40",
          paddingHorizontal: isSmall ? 8 : 10,
          paddingVertical: isSmall ? 2 : 4,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color, fontSize: isSmall ? 11 : 12 },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
});
