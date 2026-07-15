import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

const PERSONA_PLACEHOLDER = `Describe who the AI should play. Include:
• Name, role, hospital/site (e.g., "Dr. Sarah Kim, radiologist at St. Mary's, Houston TX")
• The exact problem and what they've already tried
• Personality & urgency level (anxious, professional, impatient, etc.)
• Your org-specific details: PACS name, AE Titles, server names
• Example: "Your PACS is Synapse. The AE Title showing on the scanner is 'CT_CANON_01'. You've been on hold for 20 minutes and have 5 cases waiting."`;

interface FormState {
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  objective: string;
  estimatedMinutes: string;
  customerPersonaPrompt: string;
  hints: string[];
  keyPhrases: string[];
}

interface Errors {
  title?: string;
  description?: string;
  objective?: string;
  customerPersonaPrompt?: string;
}

export default function CreateScenarioScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createScenario } = useCustomScenarios();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    difficulty: "medium",
    category: "",
    objective: "",
    estimatedMinutes: "10",
    customerPersonaPrompt: "",
    hints: [""],
    keyPhrases: [""],
  });

  const [errors, setErrors] = useState<Errors>({});

  const set = (key: keyof FormState, value: string | string[]) => {
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
      await createScenario({
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
      Alert.alert("Error", "Failed to save scenario. Please try again.");
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
            placeholder="Brief summary of the issue the caller is facing"
            value={form.description}
            onChangeText={(v) => set("description", v)}
            multiline
            error={errors.description}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
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
                          form.difficulty === d
                            ? DIFF_COLORS[d]
                            : colors.card,
                        borderColor:
                          form.difficulty === d
                            ? DIFF_COLORS[d]
                            : colors.border,
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
            This tells the AI exactly who to role-play as. The more specific you are — real PACS names, AE Titles, urgency level — the more realistic the practice.
          </Text>
          <FormField
            label="Customer Persona"
            required
            placeholder={PERSONA_PLACEHOLDER}
            value={form.customerPersonaPrompt}
            onChangeText={(v) => set("customerPersonaPrompt", v)}
            multiline
            style={{ minHeight: 160 }}
            error={errors.customerPersonaPrompt}
          />

          <View
            style={[
              styles.exampleBox,
              { backgroundColor: colors.accent + "08", borderColor: colors.accent + "20" },
            ]}
          >
            <Text style={[styles.exampleLabel, { color: colors.accent }]}>
              Example persona:
            </Text>
            <Text style={[styles.exampleText, { color: colors.mutedForeground }]}>
              {`You are Jason Mills, a CT tech at Riverside Community Hospital in San Diego. Your Siemens SOMATOM Edge scanner (AE Title: "SOMATOM_CT1", IP: 192.168.10.45) cannot send to your Synapse PACS (AE Title: "SYNAPSE_MAIN"). The error on the scanner reads "Connection Refused". You have 6 studies backed up. Your last scan was 45 minutes ago. You're frustrated but cooperative. The PACS admin changed some network settings yesterday.`}
            </Text>
          </View>
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
            hint="Sample phrases the agent should use (scripts & tone)"
            items={form.keyPhrases}
            placeholder={`e.g., "I can see the issue — let me update the AE Title on our end"`}
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
                Save Scenario
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
  row: { marginBottom: 18 },
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
  exampleBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  exampleLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  exampleText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    fontStyle: "italic",
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
