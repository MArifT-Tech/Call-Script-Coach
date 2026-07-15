import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
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
  withTiming,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import type { RefEntry } from "@/constants/reference";

interface ReferenceEntryCardProps {
  entry: RefEntry;
  accentColor: string;
  searchQuery?: string;
}

function highlightText(text: string, query: string, baseColor: string, highlightColor: string) {
  if (!query.trim()) {
    return <Text style={{ color: baseColor }}>{text}</Text>;
  }
  const lower = text.toLowerCase();
  const lowerQ = query.toLowerCase();
  const idx = lower.indexOf(lowerQ);
  if (idx === -1) return <Text style={{ color: baseColor }}>{text}</Text>;

  return (
    <Text style={{ color: baseColor }}>
      {text.slice(0, idx)}
      <Text style={{ backgroundColor: highlightColor + "40", color: highlightColor, fontFamily: "Inter_600SemiBold" }}>
        {text.slice(idx, idx + query.length)}
      </Text>
      {text.slice(idx + query.length)}
    </Text>
  );
}

export function ReferenceEntryCard({ entry, accentColor, searchQuery = "" }: ReferenceEntryCardProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(!!searchQuery);
  const rotate = useSharedValue(0);
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const handleToggle = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const next = !expanded;
    setExpanded(next);
    rotate.value = withSpring(next ? 90 : 0, { damping: 15 });
    opacity.value = withTiming(next ? 1 : 0, { duration: 200 });
  };

  React.useEffect(() => {
    if (searchQuery) {
      setExpanded(true);
      rotate.value = withSpring(90, { damping: 15 });
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [searchQuery]);

  const expandedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Pressable onPress={handleToggle} style={styles.header}>
        <View style={styles.headerLeft}>
          {entry.value && (
            <View
              style={[
                styles.valueBadge,
                { backgroundColor: accentColor + "15", borderColor: accentColor + "30" },
              ]}
            >
              <Text style={[styles.valueText, { color: accentColor }]}>
                {entry.value}
              </Text>
            </View>
          )}
          <Text
            style={[styles.label, { color: colors.foreground }]}
            numberOfLines={expanded ? undefined : 2}
          >
            {highlightText(entry.label, searchQuery, colors.foreground, accentColor)}
          </Text>
        </View>
        <Animated.View style={chevronStyle}>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </Animated.View>
      </Pressable>

      {expanded && (
        <Animated.View style={[styles.body, expandedStyle]}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.description, { color: colors.foreground }]}>
            {entry.description}
          </Text>
          {entry.tags && entry.tags.length > 0 && (
            <View style={styles.tags}>
              {entry.tags.slice(0, 5).map((tag) => (
                <View
                  key={tag}
                  style={[styles.tag, { backgroundColor: colors.muted }]}
                >
                  <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    gap: 8,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  valueBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 2,
  },
  valueText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  tag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
});
