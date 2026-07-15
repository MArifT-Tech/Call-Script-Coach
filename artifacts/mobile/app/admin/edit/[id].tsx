import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { useCustomScenarios } from "@/context/CustomScenariosContext";
import type { Difficulty } from "@/constants/scenarios";
import { FormField } from "@/components/FormField";
import { DynamicListEditor } from "@/components/DynamicListEditor";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const DIFF_LABELS = { easy: "Easy", medium: "Medium", hard: "Hard" };
const DIFF_COLORS = { easy: "#22C55E", medium: "#F59E0B", hard: "#EF4444" };

interface Errors {
  title?: string;
  description?: string;
  objective?: string;
  customerPersonaPrompt?: string;
}

export default function EditScenarioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getCustomScenario, updateScenario } = useCustomScenarios();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const scenario = getCustomScenario(id);

  const [form, setForm] = useState({
    title: scenario?.title ?? "",
    description: scenario?.description ?? "",
    difficulty: (scenario?.difficulty ?? "medium") as Difficulty,
    category: scenario?.category ?? "",
    objective: scenario?.objective ?? "",
    estimatedMinutes: String(scenario?.estimatedMinutes ?? "10"),
    customerPersonaPrompt: scenario?.customerPersonaPrompt ?? "",
    hints: scenario?.hints?.length ? scenario.hints : [""],
    keyPhrases: scenario?.keyPhrases?.length ? scenario.keyPhrases : [""],
  });

  if (!scenario) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Scenario not found</Text>
      </View>
    );
  }

  const set = (key: string, value: string | string[]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as keyof Errors]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.objective.trim()) newErrors.objective = "Objective is required";
    if (!form.customerPersonaPrompt.trim())
      newErrors.customerPersonaPrompt = "Customer persona is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const mins = parseInt(form.estimatedMinutes, 10);
      await updateScenario(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        difficulty: form.difficulty,
        category: form.category.trim() || "Custom",
        objective: form.objective.trim(),
        estimatedMinutes: isNaN(mins) ? 10 : Math.max(1, Math.min(60, mins)),
        customerPersonaPrompt: form.customerPersonaPrompt.trim(),
        hints: form.hints.filter((h) => h.trim()),
        keyPhrases: form.keyPhrases.filter((k) => k.trim()),
      });
      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Basic Information
          </Text>

          <FormField
            label="Scenario Title"
            required
            placeholder="e.g., Synapse Viewer Won't Launch at Site B"
            value={form.title}
            onChangeText={(v) => set("title", v)}
            error={errors.title}
          />

          <FormField
            label="Short Description"
            required
            placeholder="Brief summary of the caller's issue"
            value={form.description}
            onChangeText={(v) => set("description", v)}
            multiline
            error={errors.description}
          />

          <View style={styles.diffSection}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Difficulty
            </Text>
            <View style={styles.diffRow}>
              {DIFFICULTIES.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => set("difficulty", d)}
                  style={[
                    styles.diffChip,
                    {
                      backgroundColor:
                        form.difficulty === d ? DIFF_COLORS[d] : colors.card,
                      borderColor:
                        form.difficulty === d ? DIFF_COLORS[d] : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.diffText,
                      {
                        color:
                          form.difficulty === d ? "#fff" : colors.foreground,
                      },
                    ]}
                  >
                    {DIFF_LABELS[d]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <FormField
                label="Category"
                placeholder="e.g., Modality Connectivity"
                value={form.category}
                onChangeText={(v) => set("category", v)}
              />
            </View>
            <View style={{ width: 100 }}>
              <FormField
                label="Est. Minutes"
                placeholder="10"
                value={form.estimatedMinutes}
                onChangeText={(v) => set("estimatedMinutes", v)}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>

          <FormField
            label="Agent Objective"
            required
            placeholder="What the agent should achieve in this call"
            value={form.objective}
            onChangeText={(v) => set("objective", v)}
            multiline
            error={errors.objective}
          />
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.card,
              borderColor: colors.primary + "30",
              borderWidth: 1.5,
            },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <Feather name="user" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Customer Persona (AI Prompt)
            </Text>
          </View>
          <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
            Describes who the AI plays. Include your real PACS name, AE Titles, server IPs, and the caller's personality.
          </Text>
          <FormField
            label="Customer Persona"
            required
            placeholder="Describe the customer: name, role, site, exact problem, personality, and org-specific PACS details..."
            value={form.customerPersonaPrompt}
            onChangeText={(v) => set("customerPersonaPrompt", v)}
            multiline
            style={{ minHeight: 140 }}
            error={errors.customerPersonaPrompt}
          />
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Agent Guidance
          </Text>

          <DynamicListEditor
            label="Hints"
            hint="Step-by-step hints the agent can see during the call"
            items={form.hints}
            placeholder="e.g., Check PACS DICOM device list for the modality's AE Title"
            onChange={(v) => set("hints", v)}
          />

          <DynamicListEditor
            label="Key Phrases"
            hint="Sample phrases and scripts for the agent to use"
            items={form.keyPhrases}
            placeholder={`e.g., "Let me check the AE Title configuration on our end"`}
            onChange={(v) => set("keyPhrases", v)}
          />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: bottomPad + 12,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.cancelBtn, { borderColor: colors.border }]}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={[styles.cancelText, { color: colors.foreground }]}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: saving ? colors.muted : colors.primary },
          ]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <>
              <Feather name="check" size={18} color={colors.primaryForeground} />
              <Text style={[styles.saveText, { color: colors.primaryForeground }]}>
                Save Changes
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, gap: 12 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    marginBottom: 14,
  },
  sectionHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
    marginTop: -8,
    marginBottom: 14,
  },
  fieldLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 8,
  },
  diffSection: { marginBottom: 18 },
  diffRow: {
    flexDirection: "row",
    gap: 8,
  },
  diffChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  diffText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  twoCol: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  saveBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
