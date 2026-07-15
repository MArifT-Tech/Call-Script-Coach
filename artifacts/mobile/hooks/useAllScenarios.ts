import { useMemo } from "react";
import { SCENARIOS, type Scenario } from "@/constants/scenarios";
import { useCustomScenarios, type CustomScenario } from "@/context/CustomScenariosContext";

export type AnyScenario = (Scenario & { isCustom?: false }) | CustomScenario;

export function useAllScenarios(): AnyScenario[] {
  const { customScenarios } = useCustomScenarios();
  return useMemo(
    () => [...SCENARIOS, ...customScenarios],
    [customScenarios]
  );
}

export function useAnyScenario(id: string): AnyScenario | undefined {
  const { getCustomScenario } = useCustomScenarios();
  if (id.startsWith("custom_")) {
    return getCustomScenario(id);
  }
  return SCENARIOS.find((s) => s.id === id);
}
