import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Difficulty } from "@/constants/scenarios";

export interface CustomScenario {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  objective: string;
  estimatedMinutes: number;
  hints: string[];
  keyPhrases: string[];
  customerPersonaPrompt: string;
  createdAt: string;
  updatedAt: string;
  isCustom: true;
}

export type CustomScenarioInput = Omit<
  CustomScenario,
  "id" | "createdAt" | "updatedAt" | "isCustom"
>;

interface CustomScenariosContextType {
  customScenarios: CustomScenario[];
  createScenario: (input: CustomScenarioInput) => Promise<CustomScenario>;
  updateScenario: (
    id: string,
    input: CustomScenarioInput
  ) => Promise<CustomScenario>;
  deleteScenario: (id: string) => Promise<void>;
  getCustomScenario: (id: string) => CustomScenario | undefined;
}

const CustomScenariosContext =
  createContext<CustomScenariosContextType | null>(null);

const STORAGE_KEY = "@support_trainer/custom_scenarios";

function generateId(): string {
  return "custom_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function CustomScenariosProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customScenarios, setCustomScenarios] = useState<CustomScenario[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          setCustomScenarios(JSON.parse(raw) as CustomScenario[]);
        }
      })
      .catch(() => {});
  }, []);

  const persist = useCallback(async (updated: CustomScenario[]) => {
    setCustomScenarios(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const createScenario = useCallback(
    async (input: CustomScenarioInput): Promise<CustomScenario> => {
      const now = new Date().toISOString();
      const scenario: CustomScenario = {
        ...input,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        isCustom: true,
      };
      await persist([...customScenarios, scenario]);
      return scenario;
    },
    [customScenarios, persist]
  );

  const updateScenario = useCallback(
    async (id: string, input: CustomScenarioInput): Promise<CustomScenario> => {
      const now = new Date().toISOString();
      const updated = customScenarios.map((s) =>
        s.id === id ? { ...s, ...input, updatedAt: now } : s
      );
      const scenario = updated.find((s) => s.id === id)!;
      await persist(updated);
      return scenario;
    },
    [customScenarios, persist]
  );

  const deleteScenario = useCallback(
    async (id: string): Promise<void> => {
      await persist(customScenarios.filter((s) => s.id !== id));
    },
    [customScenarios, persist]
  );

  const getCustomScenario = useCallback(
    (id: string): CustomScenario | undefined => {
      return customScenarios.find((s) => s.id === id);
    },
    [customScenarios]
  );

  return (
    <CustomScenariosContext.Provider
      value={{
        customScenarios,
        createScenario,
        updateScenario,
        deleteScenario,
        getCustomScenario,
      }}
    >
      {children}
    </CustomScenariosContext.Provider>
  );
}

export function useCustomScenarios(): CustomScenariosContextType {
  const ctx = useContext(CustomScenariosContext);
  if (!ctx)
    throw new Error(
      "useCustomScenarios must be used within CustomScenariosProvider"
    );
  return ctx;
}
