import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { setBaseUrl } from "@workspace/api-client-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProgressProvider } from "@/context/ProgressContext";
import { CustomScenariosProvider } from "@/context/CustomScenariosContext";

setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="scenario/[id]"
        options={{ title: "Scenario Brief", headerBackTitle: "Scenarios" }}
      />
      <Stack.Screen
        name="roleplay/[id]"
        options={{ title: "Role Play", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="feedback/[id]"
        options={{
          title: "Session Feedback",
          headerBackTitle: "Home",
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="session/[id]"
        options={{ title: "Session Review", headerBackTitle: "Progress" }}
      />
      <Stack.Screen
        name="admin/create"
        options={{
          title: "New Scenario",
          headerBackTitle: "Admin",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="admin/edit/[id]"
        options={{
          title: "Edit Scenario",
          headerBackTitle: "Admin",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ProgressProvider>
            <CustomScenariosProvider>
              <GestureHandlerRootView>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </CustomScenariosProvider>
          </ProgressProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
