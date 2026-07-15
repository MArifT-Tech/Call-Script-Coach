import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useSendRoleplayMessage,
  useGetRoleplayFeedback,
  useTranscribeRoleplayAudio,
  useSynthesizeRoleplaySpeech,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useAnyScenario } from "@/hooks/useAllScenarios";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { MessageBubble } from "@/components/MessageBubble";
import { HintPanel } from "@/components/HintPanel";
import { QuickRefModal } from "@/components/QuickRefModal";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const AGENT_OPENING =
  "Thank you for calling technical support, you are talking to Mat. Can we start with your phone number please?";

export default function RoleplayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);

  const scenario = useAnyScenario(id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showHints, setShowHints] = useState(false);
  const [showRef, setShowRef] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const sendMessage = useSendRoleplayMessage();
  const getFeedback = useGetRoleplayFeedback();
  const transcribeAudio = useTranscribeRoleplayAudio();
  const synthesizeSpeech = useSynthesizeRoleplaySpeech();

  const recorder = useVoiceRecorder();
  const player = useAudioPlayer();
  const voiceAvailable = recorder.isSupported && player.isSupported;
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const endedRef = useRef(false);

  const speakResponse = useCallback(
    (text: string) => {
      if (!voiceMode || !player.isSupported || !text.trim()) return;
      if (endedRef.current) return;
      synthesizeSpeech.mutate(
        { data: { text } },
        {
          onSuccess: (audio) => {
            if (endedRef.current) return;
            player.play(audio.audioBase64, audio.mimeType);
          },
        },
      );
    },
    [voiceMode, player, synthesizeSpeech],
  );

  useEffect(() => {
    navigation.setOptions({ title: scenario?.title ?? "Role Play" });
  }, [navigation, scenario]);

  const customPrompt =
    scenario && "isCustom" in scenario && scenario.isCustom
      ? scenario.customerPersonaPrompt
      : undefined;

  const handleStart = useCallback(async () => {
    if (!scenario) return;
    setIsStarted(true);

    // Hard-coded trainee opening line — shown on screen and spoken first.
    const openingMsg: ChatMessage = { role: "user", content: AGENT_OPENING };
    setMessages([openingMsg]);
    speakResponse(AGENT_OPENING);

    sendMessage.mutate(
      {
        data: {
          scenarioId: scenario.id,
          messages: [openingMsg],
          ...(customPrompt ? { customSystemPrompt: customPrompt } : {}),
        },
      },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.response },
          ]);
          speakResponse(data.response);
        },
      }
    );
  }, [scenario, sendMessage, customPrompt, speakResponse]);

  useEffect(() => {
    handleStart();
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || !scenario || sendMessage.isPending) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const userMsg: ChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");

    sendMessage.mutate(
      {
        data: {
          scenarioId: scenario.id,
          messages: nextMessages,
          ...(customPrompt ? { customSystemPrompt: customPrompt } : {}),
        },
      },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.response },
          ]);
          setTimeout(() => {
            flatRef.current?.scrollToEnd({ animated: true });
          }, 100);
          speakResponse(data.response);
        },
      }
    );
  }, [input, messages, scenario, sendMessage, customPrompt, speakResponse]);

  const sendTranscribedText = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !scenario || sendMessage.isPending) return;

      const userMsg: ChatMessage = { role: "user", content: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);

      sendMessage.mutate(
        {
          data: {
            scenarioId: scenario.id,
            messages: nextMessages,
            ...(customPrompt ? { customSystemPrompt: customPrompt } : {}),
          },
        },
        {
          onSuccess: (data) => {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: data.response },
            ]);
            setTimeout(() => {
              flatRef.current?.scrollToEnd({ animated: true });
            }, 100);
            speakResponse(data.response);
          },
        },
      );
    },
    [messages, scenario, sendMessage, customPrompt, speakResponse],
  );

  const handleMicPress = useCallback(async () => {
    setVoiceError(null);
    if (recorder.isRecording) {
      const result = await recorder.stop();
      if (!result) {
        setVoiceError(recorder.error ?? "No audio captured. Try again.");
        return;
      }
      transcribeAudio.mutate(
        {
          data: {
            audioBase64: result.audioBase64,
            mimeType: result.mimeType,
          },
        },
        {
          onSuccess: (data) => {
            if (data.text.trim()) {
              sendTranscribedText(data.text);
            } else {
              setVoiceError("I couldn't hear that. Please try again.");
            }
          },
          onError: () => {
            setVoiceError("Transcription failed. Please try again.");
          },
        },
      );
      return;
    }

    if (player.isPlaying) player.stop();
    const ok = await recorder.start();
    if (!ok && recorder.error) setVoiceError(recorder.error);
  }, [recorder, transcribeAudio, sendTranscribedText, player]);

  const toggleVoiceMode = useCallback(() => {
    if (!voiceAvailable) {
      setVoiceError(
        "Voice mode isn't supported on this device. Please use text.",
      );
      return;
    }
    setVoiceError(null);
    if (voiceMode) {
      if (recorder.isRecording) recorder.cancel();
      if (player.isPlaying) player.stop();
    }
    setVoiceMode((v) => !v);
  }, [voiceMode, voiceAvailable, recorder, player]);

  const handleEndCall = useCallback(() => {
    if (!scenario || messages.length < 2) return;

    // Cut off any AI audio / in-flight recording immediately on hang-up.
    endedRef.current = true;
    if (player.isPlaying) player.stop();
    if (recorder.isRecording) recorder.cancel();

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    const snapshotMessages = [...messages];

    getFeedback.mutate(
      {
        data: {
          scenarioId: scenario.id,
          messages: snapshotMessages,
          ...(customPrompt ? { customSystemPrompt: customPrompt } : {}),
        },
      },
      {
        onSuccess: (data) => {
          router.replace({
            pathname: "/feedback/[id]",
            params: {
              id: scenario.id,
              scenarioId: scenario.id,
              score: String(data.score),
              summary: data.summary,
              strengths: JSON.stringify(data.strengths),
              improvements: JSON.stringify(data.improvements),
              messageCount: String(
                snapshotMessages.filter((m) => m.role === "user").length
              ),
              messagesJson: JSON.stringify(snapshotMessages),
            },
          });
        },
      }
    );
  }, [scenario, messages, getFeedback, router, customPrompt, player, recorder]);

  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  if (!scenario) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Scenario not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "web" ? 0 : 90}
    >
      <View
        style={[
          styles.callBanner,
          {
            backgroundColor: colors.primary + "10",
            borderBottomColor: colors.primary + "20",
          },
        ]}
      >
        <View style={styles.bannerLeft}>
          <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
          <Text
            style={[styles.bannerText, { color: colors.primary }]}
            numberOfLines={1}
          >
            Live Practice — {scenario.title}
          </Text>
        </View>
        <View style={styles.bannerActions}>
          <TouchableOpacity
            onPress={() => setShowRef(true)}
            style={[
              styles.refButton,
              {
                backgroundColor: colors.primary + "15",
                borderColor: colors.primary + "30",
              },
            ]}
          >
            <Feather name="book-open" size={14} color={colors.primary} />
            <Text style={[styles.refButtonText, { color: colors.primary }]}>
              REF
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowHints((v) => !v)}>
            <Feather
              name={showHints ? "eye-off" : "eye"}
              size={18}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleVoiceMode}
            style={[
              styles.voiceToggle,
              voiceMode && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
              !voiceMode && {
                backgroundColor: colors.primary + "15",
                borderColor: colors.primary + "30",
              },
              !voiceAvailable && { opacity: 0.5 },
            ]}
          >
            <Feather
              name={voiceMode ? "mic" : "mic-off"}
              size={13}
              color={voiceMode ? colors.primaryForeground : colors.primary}
            />
            <Text
              style={[
                styles.voiceToggleText,
                { color: voiceMode ? colors.primaryForeground : colors.primary },
              ]}
            >
              {voiceMode ? "VOICE" : "TEXT"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {voiceError && (
        <View
          style={[
            styles.voiceErrorBar,
            {
              backgroundColor: colors.destructive + "12",
              borderBottomColor: colors.destructive + "30",
            },
          ]}
        >
          <Feather name="alert-circle" size={13} color={colors.destructive} />
          <Text style={[styles.voiceErrorText, { color: colors.destructive }]}>
            {voiceError}
          </Text>
        </View>
      )}

      <QuickRefModal
        visible={showRef}
        onClose={() => setShowRef(false)}
        scenarioCategory={scenario.category}
      />

      {showHints && (
        <HintPanel hints={scenario.hints} keyPhrases={scenario.keyPhrases} />
      )}

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index }) => (
          <MessageBubble role={item.role} content={item.content} index={index} />
        )}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatRef.current?.scrollToEnd({ animated: true })
        }
        ListHeaderComponent={
          !isStarted || (sendMessage.isPending && messages.length === 0) ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
              <Text
                style={[styles.loadingText, { color: colors.mutedForeground }]}
              >
                Connecting to customer...
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          sendMessage.isPending && messages.length > 0 ? (
            <View style={styles.typing}>
              <ActivityIndicator size="small" color={colors.mutedForeground} />
              <Text
                style={[styles.typingText, { color: colors.mutedForeground }]}
              >
                Customer is typing...
              </Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!!messages.length}
      />

      <View
        style={[
          styles.inputArea,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: bottomPadding + 8,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.endCallButton,
            {
              backgroundColor: getFeedback.isPending
                ? colors.muted
                : colors.destructive + "15",
              borderColor: colors.destructive + "30",
            },
          ]}
          onPress={handleEndCall}
          disabled={getFeedback.isPending || messages.length < 2}
          activeOpacity={0.7}
        >
          {getFeedback.isPending ? (
            <ActivityIndicator size="small" color={colors.destructive} />
          ) : (
            <Feather name="phone-off" size={18} color={colors.destructive} />
          )}
        </TouchableOpacity>

        {voiceMode ? (
          <View style={styles.voiceInputRow}>
            <View style={styles.voiceStatusWrap}>
              <Text
                style={[styles.voiceStatus, { color: colors.mutedForeground }]}
                numberOfLines={1}
              >
                {recorder.isRecording
                  ? "Listening... tap to send"
                  : transcribeAudio.isPending
                    ? "Transcribing..."
                    : sendMessage.isPending
                      ? "Customer responding..."
                      : synthesizeSpeech.isPending || player.isPlaying
                        ? "Customer is speaking..."
                        : "Tap mic to speak"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleMicPress}
              disabled={
                transcribeAudio.isPending ||
                sendMessage.isPending ||
                synthesizeSpeech.isPending
              }
              activeOpacity={0.8}
              style={[
                styles.micButton,
                {
                  backgroundColor: recorder.isRecording
                    ? colors.destructive
                    : transcribeAudio.isPending ||
                        sendMessage.isPending ||
                        synthesizeSpeech.isPending
                      ? colors.muted
                      : colors.primary,
                },
                recorder.isRecording && styles.micButtonRecording,
              ]}
            >
              {transcribeAudio.isPending ||
              sendMessage.isPending ||
              synthesizeSpeech.isPending ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Feather
                  name={recorder.isRecording ? "square" : "mic"}
                  size={26}
                  color={colors.primaryForeground}
                />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.inputRow,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Type your response as the agent..."
              placeholderTextColor={colors.mutedForeground}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || sendMessage.isPending}
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    input.trim() && !sendMessage.isPending
                      ? colors.primary
                      : colors.muted,
                },
              ]}
            >
              <Feather
                name="send"
                size={16}
                color={
                  input.trim() && !sendMessage.isPending
                    ? colors.primaryForeground
                    : colors.mutedForeground
                }
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  callBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  bannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    overflow: "hidden",
  },
  bannerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  refButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  refButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  bannerText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    flex: 1,
  },
  messageList: {
    paddingTop: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  loading: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  typing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  typingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    fontStyle: "italic",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  endCallButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  inputRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 22,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 6,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 6,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  voiceToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  voiceToggleText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  voiceErrorBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  voiceErrorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    flex: 1,
  },
  voiceInputRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 8,
  },
  voiceStatusWrap: {
    flex: 1,
  },
  voiceStatus: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    fontStyle: "italic",
  },
  micButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  micButtonRecording: {
    transform: [{ scale: 1.05 }],
  },
});
