import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface TranscriptMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SessionRecord {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  score: number;
  completedAt: string;
  messageCount: number;
  summary?: string;
  strengths?: string[];
  improvements?: string[];
  messages?: TranscriptMessage[];
}

interface ProgressContextType {
  sessions: SessionRecord[];
  saveSession: (session: Omit<SessionRecord, "id" | "completedAt">) => Promise<SessionRecord>;
  clearHistory: () => Promise<void>;
  getBestScore: (scenarioId: string) => number | null;
  getAttemptCount: (scenarioId: string) => number;
  getSession: (id: string) => SessionRecord | undefined;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

const STORAGE_KEY = "@support_trainer/sessions";

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          setSessions(JSON.parse(raw) as SessionRecord[]);
        }
      })
      .catch(() => {});
  }, []);

  const saveSession = useCallback(
    async (session: Omit<SessionRecord, "id" | "completedAt">): Promise<SessionRecord> => {
      const record: SessionRecord = {
        ...session,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        completedAt: new Date().toISOString(),
      };
      const updated = [record, ...sessions];
      setSessions(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return record;
    },
    [sessions]
  );

  const clearHistory = useCallback(async () => {
    setSessions([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const getBestScore = useCallback(
    (scenarioId: string): number | null => {
      const relevant = sessions.filter((s) => s.scenarioId === scenarioId);
      if (relevant.length === 0) return null;
      return Math.max(...relevant.map((s) => s.score));
    },
    [sessions]
  );

  const getAttemptCount = useCallback(
    (scenarioId: string): number => {
      return sessions.filter((s) => s.scenarioId === scenarioId).length;
    },
    [sessions]
  );

  const getSession = useCallback(
    (id: string): SessionRecord | undefined => {
      return sessions.find((s) => s.id === id);
    },
    [sessions]
  );

  return (
    <ProgressContext.Provider
      value={{ sessions, saveSession, clearHistory, getBestScore, getAttemptCount, getSession }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextType {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
