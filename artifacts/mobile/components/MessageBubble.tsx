import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  index: number;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const colors = useColors();
  const isAgent = role === "user";

  return (
    <View
      style={[
        styles.container,
        isAgent ? styles.agentContainer : styles.customerContainer,
      ]}
    >
      {!isAgent && (
        <View style={[styles.avatar, { backgroundColor: colors.muted }]}>
          <Text style={[styles.avatarText, { color: colors.mutedForeground }]}>
            C
          </Text>
        </View>
      )}

      <View style={styles.bubbleWrapper}>
        <Text
          style={[
            styles.roleLabel,
            {
              color: colors.mutedForeground,
              textAlign: isAgent ? "right" : "left",
            },
          ]}
        >
          {isAgent ? "You (Agent)" : "Customer"}
        </Text>
        <View
          style={[
            styles.bubble,
            isAgent
              ? [styles.agentBubble, { backgroundColor: colors.primary }]
              : [
                  styles.customerBubble,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ],
          ]}
        >
          <Text
            style={[
              styles.text,
              {
                color: isAgent ? colors.primaryForeground : colors.foreground,
              },
            ]}
          >
            {content}
          </Text>
        </View>
      </View>

      {isAgent && (
        <View
          style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>A</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 16,
    alignItems: "flex-end",
    gap: 8,
  },
  agentContainer: {
    justifyContent: "flex-end",
  },
  customerContainer: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  bubbleWrapper: {
    maxWidth: "72%",
  },
  roleLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginBottom: 4,
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
  },
  agentBubble: {
    borderBottomRightRadius: 4,
  },
  customerBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  text: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
  },
});
