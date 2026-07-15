import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface FormFieldProps extends TextInputProps {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
}

export function FormField({
  label,
  hint,
  required,
  error,
  style,
  ...props
}: FormFieldProps) {
  const colors = useColors();

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.foreground }]}>
          {label}
          {required && (
            <Text style={{ color: colors.destructive }}> *</Text>
          )}
        </Text>
      </View>
      {hint && (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          {hint}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: error ? colors.destructive : colors.border,
            color: colors.foreground,
          },
          props.multiline && styles.multiline,
          style,
        ]}
        placeholderTextColor={colors.mutedForeground}
        {...props}
      />
      {error && (
        <Text style={[styles.error, { color: colors.destructive }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  hint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 6,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  error: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 4,
  },
});
