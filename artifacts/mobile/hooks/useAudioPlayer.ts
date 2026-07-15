import { useCallback, useEffect, useRef, useState } from "react";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";

type NativePlayer = ReturnType<typeof createAudioPlayer>;
type Subscription = { remove: () => void };

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<NativePlayer | null>(null);
  const subRef = useRef<Subscription | null>(null);
  const fileRef = useRef<string | null>(null);

  const isSupported = true;

  const cleanup = useCallback(async () => {
    if (subRef.current) {
      try {
        subRef.current.remove();
      } catch {
        // ignore
      }
      subRef.current = null;
    }
    if (playerRef.current) {
      try {
        playerRef.current.remove();
      } catch {
        // ignore
      }
      playerRef.current = null;
    }
    if (fileRef.current) {
      try {
        await FileSystem.deleteAsync(fileRef.current, { idempotent: true });
      } catch {
        // ignore
      }
      fileRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      void cleanup();
    };
  }, [cleanup]);

  const play = useCallback(
    async (audioBase64: string, mimeType: string) => {
      await cleanup();
      try {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
        const ext = mimeType.includes("mpeg")
          ? "mp3"
          : mimeType.includes("m4a")
            ? "m4a"
            : mimeType.includes("mp4")
              ? "mp4"
              : mimeType.includes("wav")
                ? "wav"
                : "mp3";
        const path = `${FileSystem.cacheDirectory}tts-${Date.now()}.${ext}`;
        await FileSystem.writeAsStringAsync(path, audioBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        fileRef.current = path;

        const player = createAudioPlayer({ uri: path });
        playerRef.current = player;

        const sub = player.addListener(
          "playbackStatusUpdate",
          (status: { didJustFinish?: boolean }) => {
            if (status?.didJustFinish) {
              setIsPlaying(false);
            }
          },
        );
        subRef.current = sub as unknown as Subscription;

        setIsPlaying(true);
        player.play();
      } catch {
        setIsPlaying(false);
      }
    },
    [cleanup],
  );

  const stop = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.pause();
      } catch {
        // ignore
      }
    }
    setIsPlaying(false);
  }, []);

  return { isSupported, isPlaying, play, stop };
}
