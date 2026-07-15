import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { REFERENCE_SECTIONS } from "@/constants/reference";

interface QuickRefModalProps {
  visible: boolean;
  onClose: () => void;
  scenarioCategory?: string;
}

const QUICK_PORTS = [
  { port: "104", label: "DICOM Standard" },
  { port: "11112", label: "DICOM TLS" },
  { port: "2575", label: "HL7 MLLP" },
  { port: "443", label: "HTTPS / Web Viewer" },
  { port: "8080", label: "HTTP Alt / Admin" },
  { port: "3389", label: "RDP Remote Desktop" },
];

const QUICK_ERRORS = [
  { code: "0x0000", label: "Success", color: "#22C55E" },
  { code: "0x0103 / 0x07", label: "AE Title Not Recognized", color: "#EF4444" },
  { code: "0xA700", label: "Out of Resources (Storage Full)", color: "#EF4444" },
  { code: "0xA900", label: "Data Set / SOP Mismatch", color: "#F59E0B" },
  { code: "0xC000", label: "Cannot Understand (Corrupt)", color: "#F59E0B" },
];

const QUICK_SERVICES = [
  { name: "C-ECHO", desc: "Verify / Ping connectivity" },
  { name: "C-STORE", desc: "Send images (modality → PACS)" },
  { name: "C-FIND", desc: "Query / Search (worklist)" },
  { name: "C-MOVE", desc: "Retrieve to 3rd destination" },
  { name: "MWL", desc: "Modality Worklist (C-FIND)" },
  { name: "MPPS", desc: "Procedure status to RIS" },
];

export function QuickRefModal({ visible, onClose, scenarioCategory }: QuickRefModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"quick" | "full">("quick");

  const bottomPad = Platform.OS === "web" ? 16 : insets.bottom + 8;

  const allEntries = REFERENCE_SECTIONS.flatMap((s) =>
    s.entries.map((e) => ({ ...e, sectionTitle: s.title, sectionColor: s.color }))
  );

  const searchResults = search.trim()
    ? allEntries.filter(
        (e) =>
          e.label.toLowerCase().includes(search.toLowerCase()) ||
          e.description.toLowerCase().includes(search.toLowerCase()) ||
          e.value?.toLowerCase().includes(search.toLowerCase()) ||
          e.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.handle,
            { backgroundColor: colors.border },
          ]}
        />

        <View
          style={[
            styles.header,
            { borderBottomColor: colors.border },
          ]}
        >
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              PACS Quick Reference
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Look up while on the call
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.searchRow,
            { borderBottomColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.searchBar,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="search" size={15} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Search anything..."
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Feather name="x" size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!search.trim() && (
          <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
            {(["quick", "full"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tab,
                  activeTab === tab && {
                    borderBottomColor: colors.primary,
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        activeTab === tab
                          ? colors.primary
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {tab === "quick" ? "Quick Cards" : "Full Reference"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomPad },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {search.trim() ? (
            searchResults.length === 0 ? (
              <View style={styles.empty}>
                <Feather name="search" size={32} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No results for "{search}"
                </Text>
              </View>
            ) : (
              searchResults.map((entry, i) => (
                <View
                  key={i}
                  style={[
                    styles.resultCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.resultHeader}>
                    <View
                      style={[
                        styles.sectionPill,
                        { backgroundColor: entry.sectionColor + "15" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sectionPillText,
                          { color: entry.sectionColor },
                        ]}
                      >
                        {entry.sectionTitle}
                      </Text>
                    </View>
                    {entry.value && (
                      <Text
                        style={[
                          styles.resultValue,
                          { color: entry.sectionColor },
                        ]}
                      >
                        {entry.value}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[styles.resultLabel, { color: colors.foreground }]}
                  >
                    {entry.label}
                  </Text>
                  <Text
                    style={[
                      styles.resultDesc,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {entry.description}
                  </Text>
                </View>
              ))
            )
          ) : activeTab === "quick" ? (
            <>
              <View style={styles.quickSection}>
                <View style={styles.sectionLabel}>
                  <Feather name="server" size={14} color="#2563EB" />
                  <Text style={[styles.sectionLabelText, { color: colors.foreground }]}>
                    Port Numbers
                  </Text>
                </View>
                <View
                  style={[
                    styles.portTable,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  {QUICK_PORTS.map((p, i) => (
                    <View
                      key={p.port}
                      style={[
                        styles.portRow,
                        i < QUICK_PORTS.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.portBadge,
                          { backgroundColor: "#2563EB15" },
                        ]}
                      >
                        <Text
                          style={[styles.portNumber, { color: "#2563EB" }]}
                        >
                          {p.port}
                        </Text>
                      </View>
                      <Text
                        style={[styles.portLabel, { color: colors.foreground }]}
                      >
                        {p.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.quickSection}>
                <View style={styles.sectionLabel}>
                  <Feather name="alert-triangle" size={14} color="#DC2626" />
                  <Text style={[styles.sectionLabelText, { color: colors.foreground }]}>
                    Status / Error Codes
                  </Text>
                </View>
                <View
                  style={[
                    styles.portTable,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  {QUICK_ERRORS.map((e, i) => (
                    <View
                      key={e.code}
                      style={[
                        styles.portRow,
                        i < QUICK_ERRORS.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.portBadge,
                          { backgroundColor: e.color + "15" },
                        ]}
                      >
                        <Text
                          style={[styles.portNumber, { color: e.color, fontSize: 10 }]}
                        >
                          {e.code}
                        </Text>
                      </View>
                      <Text
                        style={[styles.portLabel, { color: colors.foreground }]}
                      >
                        {e.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.quickSection}>
                <View style={styles.sectionLabel}>
                  <Feather name="layers" size={14} color="#7C3AED" />
                  <Text style={[styles.sectionLabelText, { color: colors.foreground }]}>
                    DICOM Services
                  </Text>
                </View>
                <View
                  style={[
                    styles.portTable,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  {QUICK_SERVICES.map((s, i) => (
                    <View
                      key={s.name}
                      style={[
                        styles.portRow,
                        i < QUICK_SERVICES.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.portBadge,
                          { backgroundColor: "#7C3AED15", minWidth: 70 },
                        ]}
                      >
                        <Text
                          style={[styles.portNumber, { color: "#7C3AED" }]}
                        >
                          {s.name}
                        </Text>
                      </View>
                      <Text
                        style={[styles.portLabel, { color: colors.foreground }]}
                      >
                        {s.desc}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.quickSection}>
                <View style={styles.sectionLabel}>
                  <Feather name="tag" size={14} color="#059669" />
                  <Text style={[styles.sectionLabelText, { color: colors.foreground }]}>
                    AE Title Rules
                  </Text>
                </View>
                <View
                  style={[
                    styles.ruleCard,
                    { backgroundColor: "#05966910", borderColor: "#05966930" },
                  ]}
                >
                  {[
                    "Max 16 characters, case-sensitive",
                    "A–Z, 0–9, underscore (_), hyphen (-) only",
                    "No spaces, no lowercase (avoid), no special chars",
                    "'Called AE' on modality must match PACS exactly",
                    "'Calling AE' (modality) must be registered in PACS",
                    "Association Rejected? → AE Title mismatch first suspect",
                  ].map((rule, i) => (
                    <View key={i} style={styles.ruleRow}>
                      <View
                        style={[
                          styles.ruleDot,
                          { backgroundColor: "#059669" },
                        ]}
                      />
                      <Text
                        style={[
                          styles.ruleText,
                          { color: colors.foreground },
                        ]}
                      >
                        {rule}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : (
            REFERENCE_SECTIONS.map((section) => (
              <View key={section.id} style={styles.quickSection}>
                <View style={styles.sectionLabel}>
                  <Feather
                    name={section.icon as keyof typeof Feather.glyphMap}
                    size={14}
                    color={section.color}
                  />
                  <Text
                    style={[
                      styles.sectionLabelText,
                      { color: colors.foreground },
                    ]}
                  >
                    {section.title}
                  </Text>
                </View>
                {section.entries.map((entry, i) => (
                  <View
                    key={i}
                    style={[
                      styles.resultCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    {entry.value && (
                      <Text
                        style={[
                          styles.resultValue,
                          { color: section.color, marginBottom: 2 },
                        ]}
                      >
                        {entry.value}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.resultLabel,
                        { color: colors.foreground },
                      ]}
                    >
                      {entry.label}
                    </Text>
                    <Text
                      style={[
                        styles.resultDesc,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {entry.description}
                    </Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 7,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    padding: 0,
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 10,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    gap: 4,
  },
  quickSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sectionLabelText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  portTable: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  portRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  portBadge: {
    minWidth: 60,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: "center",
  },
  portNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  portLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    flex: 1,
  },
  ruleCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  ruleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
    flexShrink: 0,
  },
  ruleText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  resultCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionPill: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionPillText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  resultValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  resultLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 4,
  },
  resultDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
});
