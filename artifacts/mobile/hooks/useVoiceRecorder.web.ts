import { useCallback, useEffect, useRef, useState } from "react";

export type RecordedAudio = {
  audioBase64: string;
  mimeType: string;
};

const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
  "audio/mpeg",
];

function pickSupportedMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  for (const mt of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mt)) return mt;
  }
  return "";
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read blob"));
        return;
      }
      const commaIdx = result.indexOf(",");
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function useVoiceRecorder() {
  const isSupported =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined";

  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const resolveRef = useRef<((value: RecordedAudio | null) => void) | null>(
    null,
  );

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => cleanupStream();
  }, [cleanupStream]);

  const start = useCallback(async () => {
    if (!isSupported) {
      setError("Voice recording is not supported on this device.");
      return false;
    }
    if (isRecording) return false;
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        cleanupStream();
        setIsRecording(false);
        try {
          if (blob.size === 0) {
            resolveRef.current?.(null);
          } else {
            const audioBase64 = await blobToBase64(blob);
            const mt = type.split(";")[0] ?? "audio/webm";
            resolveRef.current?.({ audioBase64, mimeType: mt });
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Recording failed");
          resolveRef.current?.(null);
        } finally {
          resolveRef.current = null;
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      return true;
    } catch (err) {
      cleanupStream();
      setIsRecording(false);
      const message =
        err instanceof Error
          ? err.message
          : "Could not access the microphone.";
      setError(
        message.includes("Permission") || message.includes("denied")
          ? "Microphone permission denied. Please enable it in your browser settings."
          : message,
      );
      return false;
    }
  }, [cleanupStream, isRecording, isSupported]);

  const stop = useCallback(async (): Promise<RecordedAudio | null> => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return null;
    return new Promise<RecordedAudio | null>((resolve) => {
      resolveRef.current = resolve;
      recorder.stop();
    });
  }, []);

  const cancel = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      resolveRef.current = null;
      recorder.onstop = null;
      recorder.stop();
    }
    cleanupStream();
    setIsRecording(false);
    chunksRef.current = [];
  }, [cleanupStream]);

  return { isSupported, isRecording, error, start, stop, cancel };
}
