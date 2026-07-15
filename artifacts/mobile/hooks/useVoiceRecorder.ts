import { useCallback, useRef, useState } from "react";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";

export type RecordedAudio = {
  audioBase64: string;
  mimeType: string;
};

export function useVoiceRecorder() {
  const nativeRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const isSupported = true;

  const start = useCallback(async () => {
    if (isRecording) return false;
    setError(null);
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setError(
          "Microphone permission denied. Enable it in Settings → PACS Support Trainer.",
        );
        return false;
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await nativeRecorder.prepareToRecordAsync();
      nativeRecorder.record();
      startedRef.current = true;
      setIsRecording(true);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not start recording.",
      );
      return false;
    }
  }, [isRecording, nativeRecorder]);

  const stop = useCallback(async (): Promise<RecordedAudio | null> => {
    if (!startedRef.current) return null;
    try {
      await nativeRecorder.stop();
      setIsRecording(false);
      startedRef.current = false;
      try {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      } catch {
        // best-effort session reset
      }
      const uri = nativeRecorder.uri;
      if (!uri) {
        setError("No audio captured. Try again.");
        return null;
      }
      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch {
        // best-effort cleanup
      }
      if (!audioBase64) return null;
      return { audioBase64, mimeType: "audio/m4a" };
    } catch (err) {
      setIsRecording(false);
      startedRef.current = false;
      setError(
        err instanceof Error ? err.message : "Could not finish recording.",
      );
      return null;
    }
  }, [nativeRecorder]);

  const cancel = useCallback(() => {
    if (!startedRef.current) {
      setIsRecording(false);
      return;
    }
    startedRef.current = false;
    setIsRecording(false);
    void (async () => {
      try {
        await nativeRecorder.stop();
      } catch {
        // ignore
      }
      const uri = nativeRecorder.uri;
      if (uri) {
        try {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        } catch {
          // ignore
        }
      }
      try {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      } catch {
        // ignore
      }
    })();
  }, [nativeRecorder]);

  return { isSupported, isRecording, error, start, stop, cancel };
}
