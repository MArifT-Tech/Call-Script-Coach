import { Feather } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface DynamicListEditorProps {
  label: string;
  hint?: string;
  items: string[];
  placeholder?: string;
  onChange: (items: string[]) => void;
  maxItems?: number;
}

export function DynamicListEditor({
  label,
  hint,
  items,
  placeholder,
  onChange,
  maxItems = 10,
}: DynamicListEditorProps) {
  const colors = useColors();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const addItem = () => {
    if (items.length >= maxItems) return;
    onChange([...items, ""]);
    setTimeout(() => {
      inputRefs.current[items.length]?.focus();
    }, 100);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.foreground }]}>
        {label}
      </Text>
      {hint && (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          {hint}
        </Text>
      )}

      {items.map((item, index) => (
        <View
          key={index}
          style={[
            styles.row,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.indexBadge,
              { backgroundColor: colors.primary + "15" },
            ]}
          >
            <Text style={[styles.indexText, { color: colors.primary }]}>
              {index + 1}
            </Text>
          </View>
          <TextInput
            ref={(r) => { inputRefs.current[index] = r; }}
            style={[styles.rowInput, { color: colors.foreground }]}
            value={item}
            onChangeText={(v) => updateItem(index, v)}
            placeholder={placeholder ?? "Enter item..."}
            placeholderTextColor={colors.mutedForeground}
            multiline
            returnKeyType="next"
            onSubmitEditing={() => {
              if (index === items.length - 1) addItem();
              else inputRefs.current[index + 1]?.focus();
            }}
          />
          <TouchableOpacity
            onPress={() => removeItem(index)}
            style={styles.removeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        onPress={addItem}
        disabled={items.length >= maxItems}
        style={[
          styles.addButton,
          {
            backgroundColor: colors.primary + "10",
            borderColor: colors.primary + "30",
            opacity: items.length >= maxItems ? 0.4 : 1,
          },
        ]}
      >
        <Feather name="plus" size={16} color={colors.primary} />
        <Text style={[styles.addText, { color: colors.primary }]}>
          Add {label.replace(/s$/, "")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 4,
  },
  hint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 8,
    marginBottom: 8,
    gap: 8,
  },
  indexBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  indexText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  rowInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 2,
  },
  removeBtn: {
    padding: 4,
    marginTop: 1,
    flexShrink: 0,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
});
